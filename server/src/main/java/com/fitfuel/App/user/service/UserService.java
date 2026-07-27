package com.fitfuel.App.user.service;

import com.fitfuel.App.user.dto.ChangePasswordRequestDTO;
import com.fitfuel.App.user.dto.UpdateProfileRequestDTO;
import com.fitfuel.App.user.dto.UserResponseDTO;
import com.fitfuel.App.user.entity.UserEntity;
import com.fitfuel.App.user.repository.UserRepository;
import com.fitfuel.App.exception.custom.UnauthorizedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponseDTO updateProfile(UserEntity user, UpdateProfileRequestDTO request) {
        user.setFullName(request.getFullName());
        UserEntity saved = userRepository.save(user);
        return new UserResponseDTO(saved.getEmail(), saved.getFullName(), saved.getRole().name());
    }

    public void changePassword(UserEntity user, ChangePasswordRequestDTO request) {
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new UnauthorizedException("Incorrect old password");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
