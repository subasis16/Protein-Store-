package com.fitfuel.App.wishlist.repository;

import com.fitfuel.App.user.entity.UserEntity;
import com.fitfuel.App.wishlist.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

  List<Wishlist> findByUser(UserEntity user);

  Optional<Wishlist> findByUserAndProductId(
      UserEntity user,
      String productId);
}
