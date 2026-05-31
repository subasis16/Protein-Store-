package com.fitfuel.App.wishlist.mapper;

import com.fitfuel.App.wishlist.dto.WishlistResponseDTO;
import com.fitfuel.App.wishlist.entity.Wishlist;
import org.springframework.stereotype.Component;

@Component
public class WishlistMapper {

  public WishlistResponseDTO toDTO(Wishlist wishlist) {

    WishlistResponseDTO dto = new WishlistResponseDTO();

    dto.setId(wishlist.getId());
    dto.setProductId(wishlist.getProductId());
    dto.setProductName(wishlist.getProductName());
    dto.setPrice(wishlist.getPrice());
    dto.setImageUrl(wishlist.getImageUrl());

    return dto;
  }
}
