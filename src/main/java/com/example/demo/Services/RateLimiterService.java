package com.example.demo.Services;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class RateLimiterService {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public boolean isAllowed(String key) {
        String redisKey = "rate_limit:" + key;
        Long count = redisTemplate.opsForValue().increment(redisKey, 1);
        
        if (count == 1) {
            redisTemplate.expire(redisKey, 60, TimeUnit.SECONDS);
        }
        return count <= 60;
    }
}