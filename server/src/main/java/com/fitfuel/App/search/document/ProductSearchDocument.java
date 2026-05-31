package com.fitfuel.App.search.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;

import java.math.BigDecimal;
import java.util.List;

@Document(indexName = "products")
public class ProductSearchDocument {

    @Id
    private String id;

    private String name;

    private String brand;

    private String description;

    private String category;

    private BigDecimal price;

    private List<String> tags;

    public ProductSearchDocument() {
    }

    public ProductSearchDocument(
            String id,
            String name,
            String brand,
            String description,
            String category,
            BigDecimal price,
            List<String> tags) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.description = description;
        this.category = category;
        this.price = price;
        this.tags = tags;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getBrand() {
        return brand;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public List<String> getTags() {
        return tags;
    }
}