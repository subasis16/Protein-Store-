package com.fitfuel.App.payment.service;

import com.fitfuel.App.cart.entity.Cart;
import com.fitfuel.App.cart.entity.CartItem;
import com.fitfuel.App.cart.repository.CartItemRepository;
import com.fitfuel.App.cart.repository.CartRepository;
import com.fitfuel.App.order.entity.Order;
import com.fitfuel.App.order.repository.OrderRepository;
import com.fitfuel.App.payment.dto.PaymentVerifyRequestDTO;
import com.fitfuel.App.payment.entity.Payment;
import com.fitfuel.App.payment.repository.PaymentRepository;
import com.fitfuel.App.product.document.ProductDocument;
import com.fitfuel.App.user.entity.UserEntity;
import com.razorpay.RazorpayClient;
import jakarta.annotation.PostConstruct;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.fitfuel.App.product.repository.ProductRepository;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private RazorpayClient razorpayClient;

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public PaymentService(
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository
    ) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @PostConstruct
    public void init() throws Exception {
        razorpayClient = new RazorpayClient(keyId, keySecret);
    }

    public String createPaymentOrder(UserEntity user, Long orderId) throws Exception {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        JSONObject options = new JSONObject();

        options.put(
                "amount",
                order.getTotalAmount().multiply(BigDecimal.valueOf(100)).intValue()
        );
        options.put("currency", "INR");
        options.put("receipt", "receipt_" + order.getId());

        com.razorpay.Order razorpayOrder =
                razorpayClient.orders.create(options);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setRazorpayOrderId(razorpayOrder.get("id"));
        payment.setAmount(order.getTotalAmount());
        payment.setStatus("CREATED");
        payment.setCreatedAt(LocalDateTime.now());

        paymentRepository.save(payment);

        return razorpayOrder.toString();
    }

    public String verifyPayment(UserEntity user,PaymentVerifyRequestDTO request) {

    Payment payment = paymentRepository
            .findByRazorpayOrderId(request.getRazorpayOrderId())
            .orElseThrow(() -> new RuntimeException("Payment not found"));

    try {
        String payload =
                request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();

        String generatedSignature = generateSignature(payload, keySecret);

        if (!generatedSignature.equals(request.getRazorpaySignature())) {
            throw new RuntimeException("Invalid payment signature");
        }

    } catch (Exception e) {
        throw new RuntimeException("Payment verification failed");
    }

    payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
    payment.setRazorpaySignature(request.getRazorpaySignature());
    payment.setStatus("PAID");

    paymentRepository.save(payment);

    Order order = payment.getOrder();
    order.setStatus("PAID");
    for (var item : order.getItems()) {

    ProductDocument product = productRepository.findById(item.getProductId())
            .orElseThrow(() -> new RuntimeException("Product not found"));

    int newStock = product.getStockQuantity() - item.getQuantity();

    if (newStock < 0) {
        throw new RuntimeException("Insufficient stock during payment");
    }

    product.setStockQuantity(newStock);
    product.setInStock(newStock > 0);

    productRepository.save(product);
}
    orderRepository.save(order);

    UserEntity orderUser = order.getUser();

    Cart cart = cartRepository.findByUser(orderUser)
            .orElseThrow(() -> new RuntimeException("Cart not found"));

    List<CartItem> cartItems = cartItemRepository.findByCart(cart);

    cartItemRepository.deleteAll(cartItems);

    cart.setTotalAmount(BigDecimal.ZERO);
    cartRepository.save(cart);

    return "Payment verified successfully";
}
private String generateSignature(String payload, String secret) throws Exception {

    Mac sha256Hmac = Mac.getInstance("HmacSHA256");

    SecretKeySpec secretKey =
            new SecretKeySpec(secret.getBytes(), "HmacSHA256");

    sha256Hmac.init(secretKey);

    byte[] hash = sha256Hmac.doFinal(payload.getBytes());

    StringBuilder hexString = new StringBuilder();

    for (byte b : hash) {
        String hex = Integer.toHexString(0xff & b);

        if (hex.length() == 1) {
            hexString.append('0');
        }

        hexString.append(hex);
    }

    return hexString.toString();
}
}