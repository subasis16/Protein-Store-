package com.fitfuel.App.product.repository;

import com.fitfuel.App.product.document.ProductDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductRepository extends MongoRepository<ProductDocument, String> {

    List<ProductDocument> findByCategory(String category);

    List<ProductDocument> findByBrand(String brand);

    List<ProductDocument> findByNameContainingIgnoreCase(String name);
}
