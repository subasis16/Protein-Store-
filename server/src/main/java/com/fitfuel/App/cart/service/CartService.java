package com.fitfuel.App.cart.service;

import com.fitfuel.App.cart.dto.AddCartItemRequestDTO;
import com.fitfuel.App.cart.dto.CartItemResponseDTO;
import com.fitfuel.App.cart.dto.CartResponseDTO;
import com.fitfuel.App.cart.dto.UpdateCartItemRequestDTO;
import com.fitfuel.App.cart.entity.Cart;
import com.fitfuel.App.cart.entity.CartItem;
import com.fitfuel.App.cart.repository.CartItemRepository;
import com.fitfuel.App.cart.repository.CartRepository;
import com.fitfuel.App.product.document.ProductDocument;
import com.fitfuel.App.product.repository.ProductRepository;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    public String addToCart(UserEntity user, AddCartItemRequestDTO request) {

        ProductDocument product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.isInStock() || product.getStockQuantity() <= 0) {
            throw new RuntimeException("Product out of stock");
        }

        if (request.getQuantity() > product.getStockQuantity()) {
            throw new RuntimeException("Requested quantity exceeds available stock");
        }

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setTotalAmount(BigDecimal.ZERO);
                    return cartRepository.save(newCart);
                });

        CartItem cartItem = cartItemRepository
                .findByCartAndProductId(cart, request.getProductId())
                .orElse(null);

        if (cartItem != null) {

            int newQuantity = cartItem.getQuantity() + request.getQuantity();

            if (newQuantity > product.getStockQuantity()) {
                throw new RuntimeException("Requested quantity exceeds available stock");
            }

            cartItem.setQuantity(newQuantity);

            BigDecimal subtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(newQuantity));

            cartItem.setSubtotal(subtotal);

            cartItemRepository.save(cartItem);

        } else {

            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProductId(product.getId());
            newItem.setProductName(product.getName());
            newItem.setQuantity(request.getQuantity());
            newItem.setPriceAtAddition(product.getPrice());

            BigDecimal subtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(request.getQuantity()));

            newItem.setSubtotal(subtotal);

            cartItemRepository.save(newItem);
        }

        recalculateCartTotal(cart);

        return "Product added to cart successfully";
    }

    public CartResponseDTO getCart(UserEntity user) {

        Cart cart = cartRepository.findByUser(user).orElse(null);
        if (cart == null) {
            CartResponseDTO response = new CartResponseDTO();
            response.setItems(new java.util.ArrayList<>());
            response.setTotalAmount(BigDecimal.ZERO);
            return response;
        }

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        List<CartItemResponseDTO> itemResponses = cartItems.stream()
                .map(item -> {
                    CartItemResponseDTO dto = new CartItemResponseDTO();
                    dto.setProductId(item.getProductId());
                    dto.setProductName(item.getProductName());
                    dto.setQuantity(item.getQuantity());
                    dto.setPrice(item.getPriceAtAddition());
                    dto.setSubtotal(item.getSubtotal());
                    productRepository.findById(item.getProductId()).ifPresent(product -> {
                        if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
                            dto.setImageUrl(product.getImageUrls().get(0));
                        }
                    });
                    return dto;
                })
                .toList();

        CartResponseDTO response = new CartResponseDTO();
        response.setItems(itemResponses);
        response.setTotalAmount(cart.getTotalAmount());

        return response;
    }

    public String updateCartItem(
            UserEntity user,
            UpdateCartItemRequestDTO request
    ) {
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem cartItem = cartItemRepository
                .findByCartAndProductId(cart, request.getProductId())
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        ProductDocument product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.isInStock() || product.getStockQuantity() <= 0) {
            throw new RuntimeException("Product out of stock");
        }

        if (request.getQuantity() > product.getStockQuantity()) {
            throw new RuntimeException("Requested quantity exceeds available stock");
        }

        cartItem.setQuantity(request.getQuantity());

        BigDecimal subtotal = cartItem.getPriceAtAddition()
                .multiply(BigDecimal.valueOf(request.getQuantity()));

        cartItem.setSubtotal(subtotal);

        cartItemRepository.save(cartItem);

        recalculateCartTotal(cart);

        return "Cart item updated successfully";
    }

    public String removeCartItem(
            UserEntity user,
            String productId
    ) {
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem cartItem = cartItemRepository
                .findByCartAndProductId(cart, productId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        cartItemRepository.delete(cartItem);

        recalculateCartTotal(cart);

        return "Cart item removed successfully";
    }

    public String clearCart(UserEntity user) {

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        cartItemRepository.deleteAll(cartItems);

        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);

        return "Cart cleared successfully";
    }

    private void recalculateCartTotal(Cart cart) {
        BigDecimal total = cartItemRepository.findByCart(cart)
                .stream()
                .map(item -> item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));

        cart.setTotalAmount(total);
        cartRepository.save(cart);
    }
}