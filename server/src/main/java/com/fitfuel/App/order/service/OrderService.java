package com.fitfuel.App.order.service;

import com.fitfuel.App.address.entity.Address;
import com.fitfuel.App.address.repository.AddressRepository;
import com.fitfuel.App.cart.entity.Cart;
import com.fitfuel.App.cart.entity.CartItem;
import com.fitfuel.App.cart.repository.CartItemRepository;
import com.fitfuel.App.cart.repository.CartRepository;
import com.fitfuel.App.order.dto.OrderItemResponseDTO;
import com.fitfuel.App.order.dto.OrderResponseDTO;
import com.fitfuel.App.order.entity.Order;
import com.fitfuel.App.order.entity.OrderItem;
import com.fitfuel.App.order.repository.OrderRepository;
import com.fitfuel.App.product.document.ProductDocument;
import com.fitfuel.App.user.entity.UserEntity;
import org.springframework.stereotype.Service;
import java.util.List;
import com.fitfuel.App.product.repository.ProductRepository;
import com.fitfuel.App.payment.entity.Payment;
import com.fitfuel.App.payment.repository.PaymentRepository;


@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;

    public OrderService(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            AddressRepository addressRepository,
            ProductRepository productRepository,
            PaymentRepository paymentRepository
    ) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.addressRepository = addressRepository;
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository;
    }

    public String placeOrder(UserEntity user, Long addressId) {

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        for (CartItem cartItem : cartItems) {

    ProductDocument product = productRepository.findById(cartItem.getProductId())
            .orElseThrow(() -> new RuntimeException("Product not found"));

    if (!product.isInStock() || product.getStockQuantity() <= 0) {
        throw new RuntimeException(product.getName() + " is out of stock");
    }

    if (cartItem.getQuantity() > product.getStockQuantity()) {
        throw new RuntimeException(
                product.getName() + " does not have enough stock"
        );
    }
}

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        Order order = new Order();
        order.setUser(user);
        order.setAddress(address);
        order.setTotalAmount(cart.getTotalAmount());
        order.setStatus("PENDING_PAYMENT");

        List<OrderItem> orderItems = cartItems.stream()
                .map(cartItem -> {
                    OrderItem item = new OrderItem();
                    item.setProductId(cartItem.getProductId());
                    item.setProductName(cartItem.getProductName());
                    item.setQuantity(cartItem.getQuantity());
                    item.setPrice(cartItem.getPriceAtAddition());
                    item.setSubtotal(cartItem.getSubtotal());
                    item.setOrder(order);
                    return item;
                })
                .toList();

        order.setItems(orderItems);

        orderRepository.save(order);

        return "Order created successfully";
    }

    public List<OrderResponseDTO> getOrders(UserEntity user) {

        List<Order> orders = orderRepository.findByUser(user);

        return orders.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OrderResponseDTO getOrderById(
            UserEntity user,
            Long orderId
    ) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        return mapToResponse(order);
    }

    private OrderResponseDTO mapToResponse(Order order) {

        OrderResponseDTO dto = new OrderResponseDTO();

        dto.setOrderId(order.getId());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());

        List<OrderItemResponseDTO> itemDTOs = order.getItems()
                .stream()
                .map(item -> {
                    OrderItemResponseDTO itemDTO =
                            new OrderItemResponseDTO();

                    itemDTO.setProductId(item.getProductId());
                    itemDTO.setProductName(item.getProductName());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setPrice(item.getPrice());
                    itemDTO.setSubtotal(item.getSubtotal());

                    return itemDTO;
                })
                .toList();

        dto.setItems(itemDTOs);

        return dto;
    }

    public String cancelOrder(
        UserEntity user,
        Long orderId
) {

    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

    if (!order.getUser().getId().equals(user.getId())) {
        throw new RuntimeException("Unauthorized");
    }

    if ("CANCELLED".equals(order.getStatus())) {
        throw new RuntimeException("Order already cancelled");
    }

    if ("PENDING_PAYMENT".equals(order.getStatus())) {
        order.setStatus("CANCELLED");
        orderRepository.save(order);
        return "Order cancelled successfully";
    }

    if ("PAID".equals(order.getStatus())) {

        for (OrderItem item : order.getItems()) {

            ProductDocument product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            int restoredStock =
                    product.getStockQuantity() + item.getQuantity();

            product.setStockQuantity(restoredStock);
            product.setInStock(true);

            productRepository.save(product);
        }

        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus("REFUND_INITIATED");
        paymentRepository.save(payment);

        order.setStatus("CANCELLED");
        orderRepository.save(order);

        return "Order cancelled and refund initiated";
    }

    throw new RuntimeException("Order cannot be cancelled");
}
}