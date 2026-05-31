package com.fitfuel.App.security.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RateLimitService {

    private static final int MAX_REQUESTS = 5;
    private static final int WINDOW_MINUTES = 1;

    private final StringRedisTemplate redisTemplate;

    public RateLimitService(
            StringRedisTemplate redisTemplate
    ) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isAllowed(String ip) {

        String key = "login_limit:" + ip;

        String currentValue =
                redisTemplate.opsForValue().get(key);

        int count =
                currentValue == null
                        ? 0
                        : Integer.parseInt(currentValue);

        if (count >= MAX_REQUESTS) {
            return false;
        }

        Long newCount =
                redisTemplate.opsForValue().increment(key);

        if (newCount != null && newCount == 1) {
            redisTemplate.expire(
                    key,
                    WINDOW_MINUTES,
                    TimeUnit.MINUTES
            );
        }

        return true;
    }
}