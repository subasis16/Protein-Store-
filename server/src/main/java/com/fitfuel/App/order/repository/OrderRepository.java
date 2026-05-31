package com.fitfuel.App.order.repository;

import com.fitfuel.App.order.entity.Order;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser(UserEntity user);
}