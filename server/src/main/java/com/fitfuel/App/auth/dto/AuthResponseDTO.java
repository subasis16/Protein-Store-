package com.fitfuel.App.auth.dto;

public class AuthResponseDTO {

    private String accessToken;
    private String tokenType;
    private String email;
    private String role;
    private String fullName;

    public AuthResponseDTO(
            String accessToken,
            String tokenType,
            String email,
            String role,
            String fullName
    ) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getFullName() {
        return fullName;
    }
}