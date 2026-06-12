package com.fitfuel.App.config;

import com.fitfuel.App.product.document.ProductDocument;
import com.fitfuel.App.product.mapper.ProductMapper;
import com.fitfuel.App.product.repository.ProductRepository;
import com.fitfuel.App.search.repository.ProductSearchRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final ProductSearchRepository productSearchRepository;

    public DataSeeder(ProductRepository productRepository, ProductSearchRepository productSearchRepository) {
        this.productRepository = productRepository;
        this.productSearchRepository = productSearchRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            System.out.println("Seeding products...");
            seedProducts();
        }
        
        // Sync to ES if empty
        if (productSearchRepository.count() == 0 && productRepository.count() > 0) {
            System.out.println("Syncing products to Elasticsearch...");
            productRepository.findAll().forEach(p -> 
                productSearchRepository.save(ProductMapper.toSearchDocument(p))
            );
        }
    }

    private void seedProducts() {
        Iterable<ProductDocument> saved = productRepository.saveAll(Arrays.asList(
            createProduct("Gold Standard 100% Whey", "Optimum Nutrition", "Proteins", "99.99", "129.99", "protein 1.jpg"),
            createProduct("Nitro-Tech Whey Gold", "MuscleTech", "Proteins", "85.50", "110.00", "protein 2.jpg"),
            createProduct("ISO100 Hydrolyzed Protein", "Dymatize", "Proteins", "105.00", "140.00", "protein 3.jpg"),
            createProduct("Syntha-6 Edge", "BSN", "Proteins", "75.99", "99.99", "protein 4.jpg"),
            createProduct("Micronized Creatine Powder", "Optimum Nutrition", "Creatine", "35.99", "45.00", "creatine 1.jpg"),
            createProduct("Platinum 100% Creatine", "MuscleTech", "Creatine", "29.99", "39.99", "creatine 2.jpg"),
            createProduct("C4 Original Pre-Workout", "Cellucor", "Pre-Workout", "45.00", "60.00", "preworkout 1.jpg"),
            createProduct("Opti-Men Multivitamin", "Optimum Nutrition", "Vitamins", "39.99", "50.00", "vitamins.jpg")
        ));
        
        saved.forEach(p -> productSearchRepository.save(ProductMapper.toSearchDocument(p)));
    }

    private ProductDocument createProduct(String name, String brand, String category, String price, String originalPrice, String image) {
        ProductDocument product = new ProductDocument();
        product.setName(name);
        product.setBrand(brand);
        product.setDescription("Premium quality " + category.toLowerCase() + " supplement to boost your workout performance.");
        product.setCategory(category);
        product.setPrice(new BigDecimal(price));
        product.setOriginalPrice(new BigDecimal(originalPrice));
        product.setInStock(true);
        product.setStockQuantity(100);
        product.setWeight("2kg");
        product.setFlavors(Arrays.asList("Chocolate", "Vanilla"));
        product.setImageUrls(Arrays.asList(image));
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        return product;
    }
}
