package com.fitfuel.App.order.controller;

import com.fitfuel.App.order.dto.OrderResponseDTO;
import com.fitfuel.App.order.service.OrderService;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/place")
    public String placeOrder(
            Authentication authentication,
            @RequestParam Long addressId,
            @RequestParam(required = false, defaultValue = "cod") String paymentMethod
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return orderService.placeOrder(user, addressId, paymentMethod);
    }

    @GetMapping
    public List<OrderResponseDTO> getOrders(
            Authentication authentication
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return orderService.getOrders(user);
    }

    @GetMapping("/{orderId}")
    public OrderResponseDTO getOrderById(
            Authentication authentication,
            @PathVariable Long orderId
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return orderService.getOrderById(user, orderId);
    }
    @PutMapping("/cancel/{orderId}")
public String cancelOrder(
        Authentication authentication,
        @PathVariable Long orderId
) {
    UserEntity user = (UserEntity) authentication.getPrincipal();

    return orderService.cancelOrder(user, orderId);
}
}