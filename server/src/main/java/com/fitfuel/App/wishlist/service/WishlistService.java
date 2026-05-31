package com.fitfuel.App.wishlist.service;

import com.fitfuel.App.product.document.ProductDocument;
import com.fitfuel.App.product.repository.ProductRepository;
import com.fitfuel.App.user.entity.UserEntity;
import com.fitfuel.App.wishlist.dto.WishlistResponseDTO;
import com.fitfuel.App.wishlist.entity.Wishlist;
import com.fitfuel.App.wishlist.mapper.WishlistMapper;
import com.fitfuel.App.wishlist.repository.WishlistRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

  private final WishlistRepository wishlistRepository;
  private final ProductRepository productRepository;
  private final WishlistMapper wishlistMapper;

  public WishlistService(
      WishlistRepository wishlistRepository,
      ProductRepository productRepository,
      WishlistMapper wishlistMapper) {
    this.wishlistRepository = wishlistRepository;
    this.productRepository = productRepository;
    this.wishlistMapper = wishlistMapper;
  }

  public String addToWishlist(
      UserEntity user,
      String productId) {

    ProductDocument product = productRepository.findById(productId)
        .orElseThrow(() -> new RuntimeException("Product not found"));

    boolean exists = wishlistRepository
        .findByUserAndProductId(user, productId)
        .isPresent();

    if (exists) {
      throw new RuntimeException("Product already in wishlist");
    }

    Wishlist wishlist = new Wishlist();

    wishlist.setUser(user);
    wishlist.setProductId(product.getId());
    wishlist.setProductName(product.getName());
    wishlist.setPrice(product.getPrice());

    if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
      wishlist.setImageUrl(product.getImageUrls().get(0));
    }

    wishlistRepository.save(wishlist);

    return "Product added to wishlist";
  }

  public List<WishlistResponseDTO> getWishlist(UserEntity user) {

    return wishlistRepository.findByUser(user)
        .stream()
        .map(wishlistMapper::toDTO)
        .toList();
  }

  public String removeFromWishlist(
      UserEntity user,
      String productId) {

    Wishlist wishlist = wishlistRepository
        .findByUserAndProductId(user, productId)
        .orElseThrow(() -> new RuntimeException("Wishlist item not found"));

    wishlistRepository.delete(wishlist);

    return "Product removed from wishlist";
  }
}
