package com.fitfuel.App.user.controller;

import com.fitfuel.App.common.response.ApiResponse;
import com.fitfuel.App.user.dto.ChangePasswordRequestDTO;
import com.fitfuel.App.user.dto.UpdateProfileRequestDTO;
import com.fitfuel.App.user.dto.UserResponseDTO;
import com.fitfuel.App.user.entity.UserEntity;
import com.fitfuel.App.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponseDTO>> profile(@AuthenticationPrincipal UserEntity user) {
        UserResponseDTO response = new UserResponseDTO(user.getEmail(), user.getFullName(), user.getRole().name());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", response));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateProfile(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody UpdateProfileRequestDTO request
    ) {
        UserResponseDTO response = userService.updateProfile(user, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody ChangePasswordRequestDTO request
    ) {
        userService.changePassword(user, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", "Password changed successfully"));
    }
}
