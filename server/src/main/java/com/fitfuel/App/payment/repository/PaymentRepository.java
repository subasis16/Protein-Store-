package com.fitfuel.App.payment.repository;

import com.fitfuel.App.order.entity.Order;
import com.fitfuel.App.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findByOrder(Order order);
}