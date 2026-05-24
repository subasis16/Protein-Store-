package com.fitfuel.App.product.service;

import com.fitfuel.App.exception.custom.ResourceNotFoundException;
import com.fitfuel.App.product.document.ProductDocument;
import com.fitfuel.App.product.dto.CreateProductRequestDTO;
import com.fitfuel.App.product.dto.ProductResponseDTO;
import com.fitfuel.App.product.mapper.ProductMapper;
import com.fitfuel.App.product.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductResponseDTO createProduct(CreateProductRequestDTO request) {
        ProductDocument doc = ProductMapper.toDocument(request);
        ProductDocument saved = productRepository.save(doc);
        return ProductMapper.toResponseDTO(saved);
    }

    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(ProductMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public ProductResponseDTO getProductById(String id) {
        ProductDocument doc = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return ProductMapper.toResponseDTO(doc);
    }

    public List<ProductResponseDTO> getProductsByCategory(String category) {
        return productRepository.findByCategory(category)
                .stream()
                .map(ProductMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDTO> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCase(query)
                .stream()
                .map(ProductMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public ProductResponseDTO updateProduct(String id, CreateProductRequestDTO request) {
        ProductDocument existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        existing.setName(request.getName());
        existing.setBrand(request.getBrand());
        existing.setDescription(request.getDescription());
        existing.setPrice(request.getPrice());
        existing.setOriginalPrice(request.getOriginalPrice());
        existing.setCategory(request.getCategory());
        existing.setFlavors(request.getFlavors());
        existing.setWeight(request.getWeight());
        existing.setImageUrls(request.getImageUrls());
        existing.setStockQuantity(request.getStockQuantity());
        existing.setInStock(request.getStockQuantity() > 0);
        existing.setUpdatedAt(LocalDateTime.now());

        ProductDocument saved = productRepository.save(existing);
        return ProductMapper.toResponseDTO(saved);
    }

    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
}
