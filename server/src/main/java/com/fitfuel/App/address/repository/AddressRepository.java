package com.fitfuel.App.address.repository;

import com.fitfuel.App.address.entity.Address;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUser(UserEntity user);
}