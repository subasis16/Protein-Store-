package com.fitfuel.App.security.filter;

import com.fitfuel.App.security.service.RateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    public LoginRateLimitFilter(
            RateLimitService rateLimitService
    ) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println("LoginRateLimitFilter: Incoming request to " + request.getRequestURI() + " [" + request.getMethod() + "]");

        if (
                (request.getRequestURI().equals("/api/auth/login") || request.getServletPath().equals("/api/auth/login"))
                        &&
                        request.getMethod().equalsIgnoreCase("POST")
        ) {

            String ip = request.getRemoteAddr();
            System.out.println("LoginRateLimitFilter: Attempting to rate limit IP: " + ip);

            if (!rateLimitService.isAllowed(ip)) {

                System.out.println("LoginRateLimitFilter: IP " + ip + " BLOCKED by rate limiter!");
                response.setStatus(429);

                response.getWriter().write(
                        "Too many login attempts. Try again later."
                );

                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
