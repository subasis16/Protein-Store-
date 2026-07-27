package com.fitfuel.App.user.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateProfileRequestDTO {
    @NotBlank(message = "Full name cannot be blank")
    private String fullName;

    public UpdateProfileRequestDTO() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}
