package com.fitfuel.App.Review.controller;

import com.fitfuel.App.Review.dto.ReviewRequestDTO;
import com.fitfuel.App.Review.dto.ReviewResponseDTO;
import com.fitfuel.App.Review.service.ReviewService;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

  private final ReviewService reviewService;

  public ReviewController(
      ReviewService reviewService) {
    this.reviewService = reviewService;
  }

  @PostMapping("/add")
  public String addReview(
      @AuthenticationPrincipal UserEntity user,
      @RequestBody ReviewRequestDTO request) {
    return reviewService.addReview(user, request);
  }

  @GetMapping
  public List<ReviewResponseDTO> getReviews(
      @RequestParam String productId) {
    return reviewService.getProductReviews(productId);
  }

  @DeleteMapping("/{reviewId}")
  public String deleteReview(
      @AuthenticationPrincipal UserEntity user,
      @PathVariable Long reviewId) {
    return reviewService.deleteReview(user, reviewId);
  }
}