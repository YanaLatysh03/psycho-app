package com.yanalatysh.psychoauthapp.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AuthInvalidStateException extends IllegalStateException{
    private final HttpStatus status;

    public AuthInvalidStateException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
