package com.fitfuel.App.wishlist.entity;

import com.fitfuel.App.user.entity.UserEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "wishlist")
public class Wishlist {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String productId;
  private String productName;
  private BigDecimal price;
  private String imageUrl;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private UserEntity user;

  public Long getId() {
    return id;
  }

  public String getProductId() {
    return productId;
  }

  public void setProductId(String productId) {
    this.productId = productId;
  }

  public String getProductName() {
    return productName;
  }

  public void setProductName(String productName) {
    this.productName = productName;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public void setPrice(BigDecimal price) {
    this.price = price;
  }

  public String getImageUrl() {
    return imageUrl;
  }

  public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
  }

  public UserEntity getUser() {
    return user;
  }

  public void setUser(UserEntity user) {
    this.user = user;
  }
}