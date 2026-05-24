package com.fitfuel.App.auth.dto;

public class AuthResponseDTO {

    private String accessToken;
    private String tokenType;
    private String email;

    public AuthResponseDTO(
            String accessToken,
            String tokenType,
            String email
    ) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.email = email;
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
}