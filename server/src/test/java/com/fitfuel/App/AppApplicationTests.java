package com.fitfuel.App;

import com.fitfuel.App.search.repository.ProductSearchRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;

@SpringBootTest
class AppApplicationTests {

	@MockitoBean
	private ProductSearchRepository productSearchRepository;

	@MockitoBean
	private ElasticsearchOperations elasticsearchOperations;

	@Test
	void contextLoads() {
	}

}

