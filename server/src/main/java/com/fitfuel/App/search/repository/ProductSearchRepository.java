package com.fitfuel.App.search.repository;

import com.fitfuel.App.search.document.ProductSearchDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

public interface ProductSearchRepository
        extends ElasticsearchRepository<ProductSearchDocument, String> {

    List<ProductSearchDocument> findByNameContaining(String keyword);

    List<ProductSearchDocument> findByCategory(String category);

    List<ProductSearchDocument> findByBrand(String brand);
}