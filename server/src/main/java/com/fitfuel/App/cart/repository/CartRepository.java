package com.fitfuel.App.cart.repository;

import com.fitfuel.App.cart.entity.Cart;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(UserEntity user);
}