package com.fitfuel.App.wishlist.controller;

import com.fitfuel.App.user.entity.UserEntity;
import com.fitfuel.App.wishlist.dto.WishlistResponseDTO;
import com.fitfuel.App.wishlist.service.WishlistService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

  private final WishlistService wishlistService;

  public WishlistController(
      WishlistService wishlistService) {
    this.wishlistService = wishlistService;
  }

  @PostMapping("/add")
  public String addToWishlist(
      @AuthenticationPrincipal UserEntity user,
      @RequestParam String productId) {
    return wishlistService.addToWishlist(user, productId);
  }

  @GetMapping
  public List<WishlistResponseDTO> getWishlist(
      @AuthenticationPrincipal UserEntity user) {
    return wishlistService.getWishlist(user);
  }

  @DeleteMapping("/remove")
  public String removeFromWishlist(
      @AuthenticationPrincipal UserEntity user,
      @RequestParam String productId) {
    return wishlistService.removeFromWishlist(user, productId);
  }
}