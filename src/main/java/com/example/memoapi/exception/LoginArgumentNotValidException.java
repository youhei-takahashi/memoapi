package com.example.memoapi.exception;

public class LoginArgumentNotValidException extends RuntimeException {
    public LoginArgumentNotValidException(String message) {
        super(message);
    }
}
