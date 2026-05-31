package com.fitfuel.App.cart.dto;

public class UpdateCartItemRequestDTO {

    private String productId;
    private Integer quantity;

    public UpdateCartItemRequestDTO() {
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
