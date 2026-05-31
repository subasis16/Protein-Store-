package com.fitfuel.App.search.controller;

import com.fitfuel.App.common.response.ApiResponse;
import com.fitfuel.App.search.document.ProductSearchDocument;
import com.fitfuel.App.search.service.ProductSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class ProductSearchController {

    private final ProductSearchService productSearchService;

    public ProductSearchController(ProductSearchService productSearchService) {
        this.productSearchService = productSearchService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductSearchDocument>>> searchProducts(
            @RequestParam String query) {
        List<ProductSearchDocument> results = productSearchService.searchByKeyword(query);
        return ResponseEntity.ok(ApiResponse.success("Search results fetched successfully", results));
    }
}
