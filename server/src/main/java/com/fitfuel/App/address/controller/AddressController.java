package com.fitfuel.App.address.controller;

import com.fitfuel.App.address.dto.AddressRequestDTO;
import com.fitfuel.App.address.dto.AddressResponseDTO;
import com.fitfuel.App.address.service.AddressService;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/address")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping("/add")
    public String addAddress(
            Authentication authentication,
            @RequestBody AddressRequestDTO request
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return addressService.addAddress(user, request);
    }

    @GetMapping
    public List<AddressResponseDTO> getAddresses(
            Authentication authentication
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return addressService.getAddresses(user);
    }

    @PutMapping("/update/{addressId}")
    public String updateAddress(
            Authentication authentication,
            @PathVariable Long addressId,
            @RequestBody AddressRequestDTO request
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return addressService.updateAddress(user, addressId, request);
    }

    @DeleteMapping("/delete/{addressId}")
    public String deleteAddress(
            Authentication authentication,
            @PathVariable Long addressId
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return addressService.deleteAddress(user, addressId);
    }

    @PutMapping("/default/{addressId}")
    public String setDefaultAddress(
            Authentication authentication,
            @PathVariable Long addressId
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return addressService.setDefaultAddress(user, addressId);
    }
}