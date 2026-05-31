package com.fitfuel.App.search.service;

import com.fitfuel.App.search.document.ProductSearchDocument;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders.multiMatch;

@Service
public class ProductSearchService {

        private final ElasticsearchOperations elasticsearchOperations;

        public ProductSearchService(ElasticsearchOperations elasticsearchOperations) {
                this.elasticsearchOperations = elasticsearchOperations;
        }

        public List<ProductSearchDocument> searchByKeyword(String query) {

                NativeQuery searchQuery = NativeQuery.builder()
                                .withQuery(
                                                multiMatch(m -> m
                                                                .query(query)
                                                                .fields(
                                                                                "name",
                                                                                "brand",
                                                                                "description",
                                                                                "category")))
                                .build();

                return elasticsearchOperations
                                .search(searchQuery, ProductSearchDocument.class)
                                .stream()
                                .map(SearchHit::getContent)
                                .collect(Collectors.toList());
        }
}