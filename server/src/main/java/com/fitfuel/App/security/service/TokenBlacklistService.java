package com.fitfuel.App.security.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class TokenBlacklistService {

    private final RedisTemplate<String, String> redisTemplate;

    public TokenBlacklistService(
            RedisTemplate<String, String> redisTemplate
    ) {
        this.redisTemplate = redisTemplate;
    }

    public void blacklistToken(
            String token,
            long expirationMillis
    ) {

        redisTemplate.opsForValue().set(
                token,
                "BLACKLISTED",
                expirationMillis,
                TimeUnit.MILLISECONDS
        );
    }

    public boolean isBlacklisted(String token) {
        try {
            Boolean hasKey = redisTemplate.hasKey(token);
            return hasKey != null && hasKey;
        } catch (Exception e) {
            return false;
        }
    }
}