package com.example.memoapi.auth;

import com.example.memoapi.dto.LoginRequest;
import com.example.memoapi.dto.LoginResponse;
import com.example.memoapi.dto.RegisterRequest;
import com.example.memoapi.exception.LoginArgumentNotValidException;
import com.example.memoapi.exception.UserRegistrationException;
import com.example.memoapi.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationService(AuthenticationManager authenticationManager, JwtService jwtService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 認証してレスポンスを返す
    public LoginResponse authentication(LoginRequest loginRequest) {
        if (loginRequest.getUsername() == null || loginRequest.getUsername().isEmpty()) {
            throw new LoginArgumentNotValidException("username is empty");
        }

        if (loginRequest.getPassword() == null || loginRequest.getPassword().isEmpty()) {
            throw new LoginArgumentNotValidException("password is empty");
        }

        // 認証
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // JWTトークンの生成
        String token = jwtService.generateToken(loginRequest.getUsername());

        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(token);
        return loginResponse;
    }

    public LoginResponse register(RegisterRequest registerRequest) {
        if (registerRequest.getUsername() == null ||
            registerRequest.getUsername().isEmpty()) {
            throw new UserRegistrationException("username is empty");
        }
        if (registerRequest.getPassword() == null ||
                registerRequest.getPassword().isEmpty()) {
            throw new UserRegistrationException("password is empty");
        }
        if (userRepository.selectUserByUsername(registerRequest.getUsername()) != null) {
            throw new UserRegistrationException("username already exists");
        }

        String encodedPassword = passwordEncoder.encode(registerRequest.getPassword());
        userRepository.insertUser(registerRequest.getUsername(), encodedPassword);

        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(jwtService.generateToken(registerRequest.getUsername()));
        return loginResponse;
    }
}
