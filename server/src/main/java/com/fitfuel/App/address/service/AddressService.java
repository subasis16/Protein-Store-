package com.fitfuel.App.address.service;

import com.fitfuel.App.address.dto.AddressRequestDTO;
import com.fitfuel.App.address.dto.AddressResponseDTO;
import com.fitfuel.App.address.entity.Address;
import com.fitfuel.App.address.repository.AddressRepository;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public String addAddress(
            UserEntity user,
            AddressRequestDTO request
    ) {
        Address address = new Address();

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setUser(user);

        addressRepository.save(address);

        return "Address added successfully";
    }

    public List<AddressResponseDTO> getAddresses(UserEntity user) {

        List<Address> addresses = addressRepository.findByUser(user);

        return addresses.stream()
                .map(address -> {
                    AddressResponseDTO dto = new AddressResponseDTO();

                    dto.setId(address.getId());
                    dto.setFullName(address.getFullName());
                    dto.setPhone(address.getPhone());
                    dto.setAddressLine1(address.getAddressLine1());
                    dto.setAddressLine2(address.getAddressLine2());
                    dto.setCity(address.getCity());
                    dto.setState(address.getState());
                    dto.setPostalCode(address.getPostalCode());
                    dto.setCountry(address.getCountry());
                    dto.setDefault(address.isDefault());

                    return dto;
                })
                .toList();
    }

    public String updateAddress(
            UserEntity user,
            Long addressId,
            AddressRequestDTO request
    ) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());

        addressRepository.save(address);

        return "Address updated successfully";
    }

    public String deleteAddress(
            UserEntity user,
            Long addressId
    ) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        addressRepository.delete(address);

        return "Address deleted successfully";
    }

    public String setDefaultAddress(
            UserEntity user,
            Long addressId
    ) {
        List<Address> addresses = addressRepository.findByUser(user);

        for (Address address : addresses) {
            address.setDefault(address.getId().equals(addressId));
        }

        addressRepository.saveAll(addresses);

        return "Default address updated successfully";
    }
}