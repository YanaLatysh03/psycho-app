package com.yanalatysh.psychogatewayapp.filter;

import com.yanalatysh.psychogatewayapp.dto.ValidationRequest;
import com.yanalatysh.psychogatewayapp.dto.ValidationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Component
public class TokenValidationFilter extends AbstractGatewayFilterFactory<TokenValidationFilter.Config> {
    private final WebClient webClient;

    @Value("${auth.service.url}")
    private String authServiceUrl;

    private static final List<String> PUBLIC_PATHS = Arrays.asList(
            "/v1/api/auth/login",
            "/v1/api/auth/register"
    );

    public TokenValidationFilter(WebClient.Builder webClientBuilder) {
        super(Config.class);
        this.webClient = webClientBuilder.build();
    }

    @Override
    public GatewayFilter apply(TokenValidationFilter.Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // Получаем список публичных путей из конфигурации или используем дефолтные
            List<String> publicPaths = config.getPublicPaths() != null && !config.getPublicPaths().isEmpty()
                    ? config.getPublicPaths()
                    : PUBLIC_PATHS;

            // Проверяем, является ли путь публичным
            boolean isPublicPath = publicPaths.stream()
                    .anyMatch(publicPath -> path.startsWith(publicPath) || path.matches(publicPath));

            // Если это публичный путь - пропускаем без валидации
            if (isPublicPath) {
                return chain.filter(exchange);
            }

            String authHeader = request.getHeaders().getFirst("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            // Валидируем токен через auth-service
            return webClient.post()
                    .uri(authServiceUrl + "/v1/api/auth/validate")
                    .body(new ValidationRequest(token), ValidationRequest.class)
                    .retrieve()
                    .bodyToMono(ValidationResponse.class)
                    .flatMap(validationResponse -> {
                        if (validationResponse.isValid()) {
                            // Токен валиден - добавляем его в заголовки и продолжаем
                            ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                                    .header("Authorization", "Bearer " + token)
                                    .build();
                            return chain.filter(exchange.mutate().request(modifiedRequest).build());
                        } else {
                            return onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
                        }
                    })
                    .onErrorResume(e -> {
                        // Ошибка при валидации
                        return onError(exchange, "Token validation failed: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
                    });
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json");
        return response.writeWith(Mono.just(response.bufferFactory()
                .wrap(("{\"error\":\"" + message + "\"}").getBytes())));
    }

    // Конфигурация фильтра
    public static class Config {
        private List<String> publicPaths; // пути без авторизации

        public List<String> getPublicPaths() {
            return publicPaths;
        }

        public void setPublicPaths(List<String> publicPaths) {
            this.publicPaths = publicPaths;
        }
    }
}
