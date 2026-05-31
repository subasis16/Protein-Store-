package com.fitfuel.App.payment.controller;

import com.fitfuel.App.payment.dto.PaymentCreateRequestDTO;
import com.fitfuel.App.payment.dto.PaymentVerifyRequestDTO;
import com.fitfuel.App.payment.service.PaymentService;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public String createPaymentOrder(
            Authentication authentication,
            @RequestBody PaymentCreateRequestDTO request
    ) throws Exception {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return paymentService.createPaymentOrder(user, request.getOrderId());
    }

    @PostMapping("/verify")
    public String verifyPayment(
            Authentication authentication,
            @RequestBody PaymentVerifyRequestDTO request
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return paymentService.verifyPayment(user, request);
    }
}