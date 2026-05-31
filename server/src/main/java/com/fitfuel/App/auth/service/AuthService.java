package com.fitfuel.App.auth.service;

import com.fitfuel.App.auth.dto.AuthResponseDTO;
import com.fitfuel.App.auth.dto.LoginRequestDTO;
import com.fitfuel.App.auth.dto.SignupRequestDTO;
import com.fitfuel.App.common.enums.Role;
import com.fitfuel.App.exception.custom.ConflictException;
import com.fitfuel.App.exception.custom.UnauthorizedException;
import com.fitfuel.App.security.service.JwtService;
import com.fitfuel.App.user.entity.UserEntity;
import com.fitfuel.App.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.fitfuel.App.security.service.TokenBlacklistService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
private final TokenBlacklistService tokenBlacklistService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            TokenBlacklistService tokenBlacklistService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
         this.tokenBlacklistService = tokenBlacklistService;
    }

    public AuthResponseDTO signup(SignupRequestDTO request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        UserEntity user = new UserEntity(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                Role.CUSTOMER
        );

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponseDTO(
                token,
                "Bearer",
                user.getEmail()
        );
    }

    public AuthResponseDTO login(LoginRequestDTO request) {

        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new UnauthorizedException("Invalid credentials")
                );

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!passwordMatches) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponseDTO(
                token,
                "Bearer",
                user.getEmail()
        );
    }

    public String logout(String token) {

    long remainingValidity =
            jwtService.getRemainingValidity(token);

    tokenBlacklistService.blacklistToken(
            token,
            remainingValidity
    );

    return "Logout successful";
}
}