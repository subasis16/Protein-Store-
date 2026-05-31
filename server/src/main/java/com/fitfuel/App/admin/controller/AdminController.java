package com.fitfuel.App.admin.controller;

import com.fitfuel.App.admin.dto.AdminProductRequestDTO;
import com.fitfuel.App.admin.service.AdminService;
import com.fitfuel.App.order.entity.Order;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

  private final AdminService adminService;

  public AdminController(
      AdminService adminService) {
    this.adminService = adminService;
  }

  @PostMapping("/products")
  public String addProduct(
      Authentication authentication,
      @RequestBody AdminProductRequestDTO request) {

    UserEntity admin = (UserEntity) authentication.getPrincipal();

    return adminService.addProduct(admin, request);
  }

  @PutMapping("/products/{productId}")
  public String updateProduct(
      Authentication authentication,
      @PathVariable String productId,
      @RequestBody AdminProductRequestDTO request) {

    UserEntity admin = (UserEntity) authentication.getPrincipal();

    return adminService.updateProduct(
        admin,
        productId,
        request);
  }

  @DeleteMapping("/products/{productId}")
  public String deleteProduct(
      Authentication authentication,
      @PathVariable String productId) {

    UserEntity admin = (UserEntity) authentication.getPrincipal();

    return adminService.deleteProduct(
        admin,
        productId);
  }

  @PutMapping("/products/{productId}/stock")
  public String updateStock(
      Authentication authentication,
      @PathVariable String productId,
      @RequestParam int stock) {

    UserEntity admin = (UserEntity) authentication.getPrincipal();

    return adminService.updateStock(
        admin,
        productId,
        stock);
  }

  @GetMapping("/users")
  public List<UserEntity> getAllUsers(
      Authentication authentication) {

    UserEntity admin = (UserEntity) authentication.getPrincipal();

    return adminService.getAllUsers(admin);
  }

  @GetMapping("/orders")
  public List<Order> getAllOrders(
      Authentication authentication) {

    UserEntity admin = (UserEntity) authentication.getPrincipal();

    return adminService.getAllOrders(admin);
  }
}
