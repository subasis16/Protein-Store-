package com.fitfuel.App.user.controller;

import com.fitfuel.App.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<String>> profile() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Protected route accessed",
                        "Welcome authenticated user"
                )
        );
    }
}
