package com.fitfuel.App.Review.service;

import com.fitfuel.App.product.document.ProductDocument;
import com.fitfuel.App.product.repository.ProductRepository;
import com.fitfuel.App.Review.dto.ReviewRequestDTO;
import com.fitfuel.App.Review.dto.ReviewResponseDTO;
import com.fitfuel.App.Review.entity.Review;
import com.fitfuel.App.Review.mapper.ReviewMapper;
import com.fitfuel.App.Review.repository.ReviewRepository;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

  private final ReviewRepository reviewRepository;
  private final ProductRepository productRepository;
  private final ReviewMapper reviewMapper;

  public ReviewService(
      ReviewRepository reviewRepository,
      ProductRepository productRepository,
      ReviewMapper reviewMapper) {
    this.reviewRepository = reviewRepository;
    this.productRepository = productRepository;
    this.reviewMapper = reviewMapper;
  }

  public String addReview(
      UserEntity user,
      ReviewRequestDTO request) {

    ProductDocument product = productRepository.findById(request.getProductId())
        .orElseThrow(() -> new RuntimeException("Product not found"));

    if (request.getRating() < 1 || request.getRating() > 5) {
      throw new RuntimeException("Rating must be between 1 and 5");
    }

    boolean alreadyReviewed = reviewRepository
        .findByUserAndProductId(user, request.getProductId())
        .isPresent();

    if (alreadyReviewed) {
      throw new RuntimeException("You already reviewed this product");
    }

    Review review = new Review();
    review.setUser(user);
    review.setProductId(request.getProductId());
    review.setRating(request.getRating());
    review.setComment(request.getComment());

    reviewRepository.save(review);

    updateProductRating(product);

    return "Review added successfully";
  }

  public List<ReviewResponseDTO> getProductReviews(String productId) {

    return reviewRepository.findByProductId(productId)
        .stream()
        .map(reviewMapper::toDTO)
        .toList();
  }

  public String deleteReview(
      UserEntity user,
      Long reviewId) {

    Review review = reviewRepository.findById(reviewId)
        .orElseThrow(() -> new RuntimeException("Review not found"));

    if (!review.getUser().getId().equals(user.getId())) {
      throw new RuntimeException("Unauthorized");
    }

    ProductDocument product = productRepository.findById(review.getProductId())
        .orElseThrow(() -> new RuntimeException("Product not found"));

    reviewRepository.delete(review);

    updateProductRating(product);

    return "Review deleted successfully";
  }

  private void updateProductRating(ProductDocument product) {

    List<Review> reviews = reviewRepository.findByProductId(product.getId());

    if (reviews.isEmpty()) {
      product.setRating(0);
      product.setReviewCount(0);
    } else {

      double average = reviews.stream()
          .mapToInt(Review::getRating)
          .average()
          .orElse(0);

      product.setRating(average);
      product.setReviewCount(reviews.size());
    }

    productRepository.save(product);
  }
}
