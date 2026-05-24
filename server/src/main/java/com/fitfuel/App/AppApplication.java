package com.fitfuel.App;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = {
	"com.fitfuel.App.user.repository",
	"com.fitfuel.App.auth.repository",
	"com.fitfuel.App.order.repository",
	"com.fitfuel.App.cart.repository",
	"com.fitfuel.App.wishlist.repository",
	"com.fitfuel.App.payment.repository",
	"com.fitfuel.App.inventory.repository"
})
@EnableMongoRepositories(basePackages = {
	"com.fitfuel.App.product.repository",
	"com.fitfuel.App.Review.repository",
	"com.fitfuel.App.search.repository"
})
public class AppApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppApplication.class, args);
	}

}
