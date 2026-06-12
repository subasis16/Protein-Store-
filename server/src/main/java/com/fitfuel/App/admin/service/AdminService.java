package com.fitfuel.App.admin.service;

import com.fitfuel.App.admin.dto.AdminProductRequestDTO;
import com.fitfuel.App.common.enums.Role;
import com.fitfuel.App.order.entity.Order;
import com.fitfuel.App.order.repository.OrderRepository;
import com.fitfuel.App.product.document.ProductDocument;
import com.fitfuel.App.product.repository.ProductRepository;
import com.fitfuel.App.user.entity.UserEntity;
import com.fitfuel.App.user.repository.UserRepository;
import com.fitfuel.App.search.repository.ProductSearchRepository;
import com.fitfuel.App.product.mapper.ProductMapper;
import com.fitfuel.App.notification.entity.NotificationEntity;
import com.fitfuel.App.notification.repository.NotificationRepository;
import com.fitfuel.App.notification.dto.NotificationRequestDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Arrays;
import java.math.BigDecimal;

@Service
public class AdminService {

  private final ProductRepository productRepository;
  private final UserRepository userRepository;
  private final OrderRepository orderRepository;
  private final ProductSearchRepository productSearchRepository;
  private final NotificationRepository notificationRepository;

  public AdminService(
      ProductRepository productRepository,
      UserRepository userRepository,
      OrderRepository orderRepository,
      ProductSearchRepository productSearchRepository,
      NotificationRepository notificationRepository) {
    this.productRepository = productRepository;
    this.userRepository = userRepository;
    this.orderRepository = orderRepository;
    this.productSearchRepository = productSearchRepository;
    this.notificationRepository = notificationRepository;
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

    ProductDocument saved = productRepository.save(product);
    // Sync to ES
    try {
      productSearchRepository.save(ProductMapper.toSearchDocument(saved));
    } catch (Exception e) {
      System.err.println("Failed to sync new product to Elasticsearch: " + e.getMessage());
    }

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

    ProductDocument saved = productRepository.save(product);
    // Sync to ES
    try {
      productSearchRepository.save(ProductMapper.toSearchDocument(saved));
    } catch (Exception e) {
      System.err.println("Failed to sync updated product to Elasticsearch: " + e.getMessage());
    }

    return "Product updated successfully";
  }

  public String deleteProduct(
      UserEntity admin,
      String productId) {
    validateAdmin(admin);

    ProductDocument product = productRepository.findById(productId)
        .orElseThrow(() -> new RuntimeException("Product not found"));

    productRepository.delete(product);
    // Sync to ES
    try {
      productSearchRepository.deleteById(productId);
    } catch (Exception e) {
      System.err.println("Failed to delete product from Elasticsearch: " + e.getMessage());
    }

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

    ProductDocument saved = productRepository.save(product);
    // Sync to ES
    try {
      productSearchRepository.save(ProductMapper.toSearchDocument(saved));
    } catch (Exception e) {
      System.err.println("Failed to sync stock update to Elasticsearch: " + e.getMessage());
    }

    return "Stock updated successfully";
  }

  public List<UserEntity> getAllUsers(UserEntity admin) {
    validateAdmin(admin);
    return userRepository.findAll();
  }

  public String deleteUser(UserEntity admin, Long userId) {
    validateAdmin(admin);
    userRepository.deleteById(userId);
    return "User deleted successfully";
  }

  public List<Order> getAllOrders(UserEntity admin) {
    validateAdmin(admin);
    return orderRepository.findAll();
  }

  public String sendNotification(UserEntity admin, NotificationRequestDTO request) {
    validateAdmin(admin);

    NotificationEntity notification = new NotificationEntity();
    notification.setTitle(request.getTitle());
    notification.setMessage(request.getMessage());
    notification.setIcon(request.getIcon() != null ? request.getIcon() : "notifications-outline");
    notification.setIconColor(request.getIconColor() != null ? request.getIconColor() : "#00FFCC");
    notification.setCreatedAt(LocalDateTime.now());

    notificationRepository.save(notification);

    return "Notification sent successfully";
  }

  public String reseedProducts(UserEntity admin) {
    validateAdmin(admin);

    productRepository.deleteAll();
    productSearchRepository.deleteAll();

    List<ProductDocument> initialProducts = Arrays.asList(
      createProduct("Gold Standard 100% Whey", "Optimum Nutrition", "Proteins", "99.99", "129.99", "protein 1.jpg"),
      createProduct("Nitro-Tech Whey Gold", "MuscleTech", "Proteins", "85.50", "110.00", "protein 2.jpg"),
      createProduct("ISO100 Hydrolyzed Protein", "Dymatize", "Proteins", "105.00", "140.00", "protein 3.jpg"),
      createProduct("Syntha-6 Edge", "BSN", "Proteins", "75.99", "99.99", "protein 4.jpg"),
      createProduct("Micronized Creatine Powder", "Optimum Nutrition", "Creatine", "35.99", "45.00", "creatine 1.jpg"),
      createProduct("Platinum 100% Creatine", "MuscleTech", "Creatine", "29.99", "39.99", "creatine 2.jpg"),
      createProduct("C4 Original Pre-Workout", "Cellucor", "Pre-Workout", "45.00", "60.00", "preworkout 1.jpg"),
      createProduct("Opti-Men Multivitamin", "Optimum Nutrition", "Vitamins", "39.99", "50.00", "vitamins.jpg")
    );

    Iterable<ProductDocument> saved = productRepository.saveAll(initialProducts);
    saved.forEach(p -> {
      try {
        productSearchRepository.save(ProductMapper.toSearchDocument(p));
      } catch (Exception e) {
        System.err.println("Failed to sync reseeded product " + p.getName() + " to ES: " + e.getMessage());
      }
    });

    return "Products reseeded successfully";
  }

  private ProductDocument createProduct(String name, String brand, String category, String price, String originalPrice, String image) {
    ProductDocument product = new ProductDocument();
    product.setName(name);
    product.setBrand(brand);
    product.setDescription("Premium quality " + category.toLowerCase() + " supplement to boost your workout performance.");
    product.setCategory(category);
    product.setPrice(new BigDecimal(price));
    product.setOriginalPrice(new BigDecimal(originalPrice));
    product.setInStock(true);
    product.setStockQuantity(100);
    product.setWeight("2kg");
    product.setFlavors(Arrays.asList("Chocolate", "Vanilla"));
    product.setImageUrls(Arrays.asList(image));
    product.setCreatedAt(LocalDateTime.now());
    product.setUpdatedAt(LocalDateTime.now());
    return product;
  }
}
