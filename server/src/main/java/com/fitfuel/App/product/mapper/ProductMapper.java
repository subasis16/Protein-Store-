package com.fitfuel.App.product.mapper;

import com.fitfuel.App.product.document.ProductDocument;
import com.fitfuel.App.product.dto.CreateProductRequestDTO;
import com.fitfuel.App.product.dto.ProductResponseDTO;
import com.fitfuel.App.search.document.ProductSearchDocument;

public class ProductMapper {

    private ProductMapper() {
        // utility class
    }

    public static ProductDocument toDocument(CreateProductRequestDTO dto) {
        ProductDocument doc = new ProductDocument();
        doc.setName(dto.getName());
        doc.setBrand(dto.getBrand());
        doc.setDescription(dto.getDescription());
        doc.setPrice(dto.getPrice());
        doc.setOriginalPrice(dto.getOriginalPrice());
        doc.setCategory(dto.getCategory());
        doc.setFlavors(dto.getFlavors());
        doc.setWeight(dto.getWeight());
        doc.setImageUrls(dto.getImageUrls());
        doc.setStockQuantity(dto.getStockQuantity());
        doc.setInStock(dto.getStockQuantity() > 0);
        doc.setRating(0.0);
        doc.setReviewCount(0);
        return doc;
    }

    public static ProductResponseDTO toResponseDTO(ProductDocument doc) {
        if (doc == null) {
            return null;
        }

        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(doc.getId());
        dto.setName(doc.getName());
        dto.setBrand(doc.getBrand());
        dto.setDescription(doc.getDescription());
        dto.setPrice(doc.getPrice());
        dto.setOriginalPrice(doc.getOriginalPrice());
        dto.setCategory(doc.getCategory());
        dto.setFlavors(doc.getFlavors());
        dto.setWeight(doc.getWeight());
        dto.setImageUrls(doc.getImageUrls());
        dto.setRating(doc.getRating());
        dto.setReviewCount(doc.getReviewCount());
        dto.setInStock(doc.isInStock());
        dto.setStockQuantity(doc.getStockQuantity());
        return dto;
    }

    public static ProductSearchDocument toSearchDocument(ProductDocument doc) {
        if (doc == null) {
            return null;
        }

        return new ProductSearchDocument(
                doc.getId(),
                doc.getName(),
                doc.getBrand(),
                doc.getDescription(),
                doc.getCategory(),
                doc.getPrice(),
                doc.getFlavors()
        );
    }
}
