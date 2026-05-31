package com.fitfuel.App.cart.dto;

public class AddCartItemRequestDTO {

    private String productId;

    private Integer quantity;

    public AddCartItemRequestDTO() {
    }

    public String getProductId() {
        return productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
