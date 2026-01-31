package com.yanalatysh.psychoauthapp.config;

import com.yanalatysh.psychoauthapp.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    /**
     * Фильтрует входящие HTTP-запросы для обработки аутентификации на основе JWT.
     *
     * Этот метод перехватывает каждый запрос и проверяет наличие JWT-токена
     * в заголовке "Authorization". Если найден действительный токен, он извлекает адрес электронной почты пользователя,
     * проверяет токен и устанавливает аутентификацию в контексте Spring Security.
     *
     * Если токен отсутствует или недействителен, запрос выполняется без аутентификации.
     * @param request входящий HTTP-запрос
     * @param response HTTP-ответ
     * @param filterChain цепочка фильтров для передачи запроса и ответа следующему фильтру
     * @throws ServletException в случае ошибки во время фильтрации
     * @throws IOException в случае ошибки ввода-вывода во время фильтрации
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getServletPath();
        if (path.equals("/auth/signup") || path.equals("/auth/login")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        final String token;
        final String email;

        // if no token, or something wrong with it, continue to next filter
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        token = authHeader.substring(7); // strip "Bearer "
        email = jwtService.extractUsername(token);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtService.validateToken(token)) {
                String role = jwtService.extractRole(token);

                // Convert role string to SimpleGrantedAuthority (expected by UsernamePasswordAuthenticationToken's superclass)
                List<SimpleGrantedAuthority> authorities =
                        List.of(new SimpleGrantedAuthority("ROLE_" + role)); // Spring requires "ROLE_" prefix

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(email, null, authorities); // roles can go here
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
