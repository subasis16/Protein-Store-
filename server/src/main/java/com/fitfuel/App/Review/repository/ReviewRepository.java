package com.fitfuel.App.Review.repository;

import com.fitfuel.App.Review.entity.Review;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

  List<Review> findByProductId(String productId);

  Optional<Review> findByUserAndProductId(
      UserEntity user,
      String productId);
}
