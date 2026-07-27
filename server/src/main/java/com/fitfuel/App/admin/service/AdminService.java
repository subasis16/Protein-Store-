package com.fitfuel.App.admin.service;

import com.fitfuel.App.admin.dto.AdminProductRequestDTO;
import com.fitfuel.App.common.enums.Role;
import com.fitfuel.App.order.entity.Order;
import com.fitfuel.App.order.entity.OrderItem;
import com.fitfuel.App.order.repository.OrderRepository;
import com.fitfuel.App.order.repository.OrderItemRepository;
import com.fitfuel.App.product.document.ProductDocument;
import com.fitfuel.App.product.repository.ProductRepository;
import com.fitfuel.App.user.entity.UserEntity;
import com.fitfuel.App.user.repository.UserRepository;
import com.fitfuel.App.search.repository.ProductSearchRepository;
import com.fitfuel.App.product.mapper.ProductMapper;
import com.fitfuel.App.notification.entity.NotificationEntity;
import com.fitfuel.App.notification.repository.NotificationRepository;
import com.fitfuel.App.notification.dto.NotificationRequestDTO;
import com.fitfuel.App.address.entity.Address;
import com.fitfuel.App.address.repository.AddressRepository;
import com.fitfuel.App.cart.entity.Cart;
import com.fitfuel.App.cart.entity.CartItem;
import com.fitfuel.App.cart.repository.CartRepository;
import com.fitfuel.App.cart.repository.CartItemRepository;
import com.fitfuel.App.Review.entity.Review;
import com.fitfuel.App.Review.repository.ReviewRepository;
import com.fitfuel.App.wishlist.entity.Wishlist;
import com.fitfuel.App.wishlist.repository.WishlistRepository;
import com.fitfuel.App.payment.entity.Payment;
import com.fitfuel.App.payment.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Arrays;
import java.util.Optional;
import java.math.BigDecimal;

@Service
public class AdminService {

  private final ProductRepository productRepository;
  private final UserRepository userRepository;
  private final OrderRepository orderRepository;
  private final OrderItemRepository orderItemRepository;
  private final ProductSearchRepository productSearchRepository;
  private final NotificationRepository notificationRepository;
  private final AddressRepository addressRepository;
  private final CartRepository cartRepository;
  private final CartItemRepository cartItemRepository;
  private final ReviewRepository reviewRepository;
  private final WishlistRepository wishlistRepository;
  private final PaymentRepository paymentRepository;

  public AdminService(
      ProductRepository productRepository,
      UserRepository userRepository,
      OrderRepository orderRepository,
      OrderItemRepository orderItemRepository,
      ProductSearchRepository productSearchRepository,
      NotificationRepository notificationRepository,
      AddressRepository addressRepository,
      CartRepository cartRepository,
      CartItemRepository cartItemRepository,
      ReviewRepository reviewRepository,
      WishlistRepository wishlistRepository,
      PaymentRepository paymentRepository) {
    this.productRepository = productRepository;
    this.userRepository = userRepository;
    this.orderRepository = orderRepository;
    this.orderItemRepository = orderItemRepository;
    this.productSearchRepository = productSearchRepository;
    this.notificationRepository = notificationRepository;
    this.addressRepository = addressRepository;
    this.cartRepository = cartRepository;
    this.cartItemRepository = cartItemRepository;
    this.reviewRepository = reviewRepository;
    this.wishlistRepository = wishlistRepository;
    this.paymentRepository = paymentRepository;
  }

  private void validateAdmin(UserEntity user) {
    if (user.getRole() != Role.ADMIN && 
        !"subasis16007@gmail.com".equalsIgnoreCase(user.getEmail()) && 
        !"lxsubasis@gmail.com".equalsIgnoreCase(user.getEmail())) {
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

  @Transactional
  public String deleteUser(UserEntity admin, Long userId) {
    validateAdmin(admin);
    if (admin.getId() != null && admin.getId().equals(userId)) {
      throw new RuntimeException("Cannot delete your own admin account.");
    }
    UserEntity user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // 1. Delete wishlist entries
    List<Wishlist> wishlists = wishlistRepository.findByUser(user);
    if (!wishlists.isEmpty()) wishlistRepository.deleteAll(wishlists);

    // 2. Delete reviews
    List<Review> allReviews = reviewRepository.findAll();
    List<Review> userReviews = allReviews.stream()
        .filter(r -> r.getUser() != null && r.getUser().getId().equals(userId))
        .toList();
    if (!userReviews.isEmpty()) reviewRepository.deleteAll(userReviews);

    // 3. Delete addresses
    List<Address> addresses = addressRepository.findByUser(user);
    if (!addresses.isEmpty()) addressRepository.deleteAll(addresses);

    // 4. Delete cart items and cart
    Optional<Cart> cartOpt = cartRepository.findByUser(user);
    if (cartOpt.isPresent()) {
      Cart cart = cartOpt.get();
      List<CartItem> cartItems = cartItemRepository.findByCart(cart);
      if (!cartItems.isEmpty()) cartItemRepository.deleteAll(cartItems);
      cartRepository.delete(cart);
    }

    // 5. Delete order items, payments, and orders
    List<Order> orders = orderRepository.findByUser(user);
    for (Order order : orders) {
      List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
      if (!orderItems.isEmpty()) orderItemRepository.deleteAll(orderItems);
      Optional<Payment> paymentOpt = paymentRepository.findByOrder(order);
      paymentOpt.ifPresent(paymentRepository::delete);
    }
    if (!orders.isEmpty()) orderRepository.deleteAll(orders);

    // 6. Finally delete the user
    userRepository.delete(user);
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
