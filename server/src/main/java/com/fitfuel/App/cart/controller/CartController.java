package com.fitfuel.App.cart.controller;

import com.fitfuel.App.cart.dto.AddCartItemRequestDTO;
import com.fitfuel.App.cart.dto.CartResponseDTO;
import com.fitfuel.App.cart.dto.UpdateCartItemRequestDTO;
import com.fitfuel.App.cart.service.CartService;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public String addToCart(
            Authentication authentication,
            @RequestBody AddCartItemRequestDTO request
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return cartService.addToCart(user, request);
    }

    @GetMapping
    public CartResponseDTO getCart(
            Authentication authentication
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return cartService.getCart(user);
    }

    @PutMapping("/update")
    public String updateCartItem(
            Authentication authentication,
            @RequestBody UpdateCartItemRequestDTO request
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return cartService.updateCartItem(user, request);
    }

    @DeleteMapping("/remove")
    public String removeCartItem(
            Authentication authentication,
            @RequestParam String productId
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return cartService.removeCartItem(user, productId);
    }

    @DeleteMapping("/clear")
    public String clearCart(
            Authentication authentication
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return cartService.clearCart(user);
    }
}