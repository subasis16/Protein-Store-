package com.fitfuel.App.auth.controller;

import com.fitfuel.App.auth.dto.AuthResponseDTO;
import com.fitfuel.App.auth.dto.LoginRequestDTO;
import com.fitfuel.App.auth.dto.SignupRequestDTO;
import com.fitfuel.App.auth.service.AuthService;
import com.fitfuel.App.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> signup(
            @Valid @RequestBody SignupRequestDTO request
    ) {
        AuthResponseDTO response = authService.signup(request);

        return ResponseEntity.ok(
                ApiResponse.success("Signup successful", response)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO request
    ) {
        AuthResponseDTO response = authService.login(request);

        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response)
        );
    }

    @PostMapping("/logout")
public ResponseEntity<ApiResponse<String>> logout(
        HttpServletRequest request
) {

    String authHeader =
            request.getHeader("Authorization");

    if (authHeader == null ||
            !authHeader.startsWith("Bearer ")) {

        throw new RuntimeException("Token missing");
    }

    String token = authHeader.substring(7);

    String response =
            authService.logout(token);

    return ResponseEntity.ok(
            ApiResponse.success(
                    "Logout successful",
                    response
            )
    );
}
}