package com.fitfuel.App.admin.service;

import com.fitfuel.App.admin.dto.AdminProductRequestDTO;
import com.fitfuel.App.common.enums.Role;
import com.fitfuel.App.order.entity.Order;
import com.fitfuel.App.order.repository.OrderRepository;
import com.fitfuel.App.product.document.ProductDocument;
import com.fitfuel.App.product.repository.ProductRepository;
import com.fitfuel.App.user.entity.UserEntity;
import com.fitfuel.App.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

  private final ProductRepository productRepository;
  private final UserRepository userRepository;
  private final OrderRepository orderRepository;

  public AdminService(
      ProductRepository productRepository,
      UserRepository userRepository,
      OrderRepository orderRepository) {
    this.productRepository = productRepository;
    this.userRepository = userRepository;
    this.orderRepository = orderRepository;
  }

  private void validateAdmin(UserEntity user) {

    if (user.getRole() != Role.ADMIN) {
      throw new RuntimeException("Access denied");
    }
  }

  public String addProduct(
      UserEntity admin,
      AdminProductRequestDTO request) {

    validateAdmin(admin);

    ProductDocument product = new ProductDocument();

    product.setName(request.getName());
    product.setBrand(request.getBrand());
    product.setDescription(request.getDescription());
    product.setPrice(request.getPrice());
    product.setOriginalPrice(request.getOriginalPrice());
    product.setCategory(request.getCategory());
    product.setFlavors(request.getFlavors());
    product.setWeight(request.getWeight());
    product.setImageUrls(request.getImageUrls());
    product.setInStock(request.isInStock());
    product.setStockQuantity(request.getStockQuantity());

    product.setCreatedAt(LocalDateTime.now());
    product.setUpdatedAt(LocalDateTime.now());

    productRepository.save(product);

    return "Product added successfully";
  }

  public String updateProduct(
      UserEntity admin,
      String productId,
      AdminProductRequestDTO request) {

    validateAdmin(admin);

    ProductDocument product = productRepository.findById(productId)
        .orElseThrow(() -> new RuntimeException("Product not found"));

    product.setName(request.getName());
    product.setBrand(request.getBrand());
    product.setDescription(request.getDescription());
    product.setPrice(request.getPrice());
    product.setOriginalPrice(request.getOriginalPrice());
    product.setCategory(request.getCategory());
    product.setFlavors(request.getFlavors());
    product.setWeight(request.getWeight());
    product.setImageUrls(request.getImageUrls());
    product.setInStock(request.isInStock());
    product.setStockQuantity(request.getStockQuantity());

    product.setUpdatedAt(LocalDateTime.now());

    productRepository.save(product);

    return "Product updated successfully";
  }

  public String deleteProduct(
      UserEntity admin,
      String productId) {

    validateAdmin(admin);

    ProductDocument product = productRepository.findById(productId)
        .orElseThrow(() -> new RuntimeException("Product not found"));

    productRepository.delete(product);

    return "Product deleted successfully";
  }

  public String updateStock(
      UserEntity admin,
      String productId,
      int stock) {

    validateAdmin(admin);

    ProductDocument product = productRepository.findById(productId)
        .orElseThrow(() -> new RuntimeException("Product not found"));

    product.setStockQuantity(stock);
    product.setInStock(stock > 0);

    productRepository.save(product);

    return "Stock updated successfully";
  }

  public List<UserEntity> getAllUsers(
      UserEntity admin) {

    validateAdmin(admin);

    return userRepository.findAll();
  }

  public List<Order> getAllOrders(
      UserEntity admin) {

    validateAdmin(admin);

    return orderRepository.findAll();
  }
}
