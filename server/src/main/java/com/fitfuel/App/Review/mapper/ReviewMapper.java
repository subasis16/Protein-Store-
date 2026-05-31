package com.fitfuel.App.Review.mapper;

import com.fitfuel.App.Review.dto.ReviewResponseDTO;
import com.fitfuel.App.Review.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

  public ReviewResponseDTO toDTO(Review review) {

    ReviewResponseDTO dto = new ReviewResponseDTO();

    dto.setId(review.getId());
    dto.setUserName(review.getUser().getName());
    dto.setRating(review.getRating());
    dto.setComment(review.getComment());
    dto.setCreatedAt(review.getCreatedAt());

    return dto;
  }
}
