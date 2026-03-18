package com.yanalatysh.psychoauthapp.exception;

import com.yanalatysh.psychoauthapp.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException e) {
        var errorDto = new ErrorResponse(
                "InvalidState",
                e.getMessage(),
                LocalDateTime.now()
        );

        if (e instanceof AuthInvalidStateException) {
            return ResponseEntity.status(((AuthInvalidStateException) e).getStatus()).body(errorDto);
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDto);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException e) {
        var errorDto = new ErrorResponse(
                "BadCredentials",
                e.getMessage(),
                LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDto);
    }
}
