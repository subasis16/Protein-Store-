package com.fitfuel.App.security.config;

import com.fitfuel.App.security.filter.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.fitfuel.App.security.filter.LoginRateLimitFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final LoginRateLimitFilter loginRateLimitFilter;

        public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,LoginRateLimitFilter loginRateLimitFilter) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
                this.loginRateLimitFilter = loginRateLimitFilter;
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOriginPatterns(List.of("*"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
                configuration.setAllowedHeaders(List.of("*"));
                configuration.setExposedHeaders(List.of("*"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                return http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
         .httpBasic(httpBasic -> httpBasic.disable())
         .formLogin(form -> form.disable())
          .sessionManagement(session -> session
          .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
.authorizeHttpRequests(auth -> auth

        .requestMatchers(
                "/api/auth/**"
        ).permitAll()

        .requestMatchers(
                "/api/admin/**"
        ).authenticated()

        .requestMatchers(
                "/api/cart/**"
        ).authenticated()

        .requestMatchers(
                "/api/orders/**"
        ).authenticated()

        .requestMatchers(
                "/api/address/**"
        ).authenticated()

        .requestMatchers(
                "/api/wishlist/**"
        ).authenticated()

        .requestMatchers(
                "/api/reviews/**"
        ).authenticated()

        .requestMatchers(
                "/api/notifications/**"
        ).authenticated()

        .requestMatchers(
                "/api/user/**"
        ).authenticated()

        .anyRequest().permitAll()
)
         .addFilterBefore(
        loginRateLimitFilter,
        UsernamePasswordAuthenticationFilter.class
)

.addFilterBefore(
        jwtAuthenticationFilter,
        UsernamePasswordAuthenticationFilter.class
)
  .build();
        }
}