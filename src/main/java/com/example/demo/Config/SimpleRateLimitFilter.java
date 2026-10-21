package com.example.demo.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.Services.RateLimiterService;

import java.io.IOException;

@Component
public class SimpleRateLimitFilter extends OncePerRequestFilter {

    @Autowired
    private RateLimiterService rateLimiterService; // Inject your service

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String clientIp = request.getRemoteAddr();

        try {
            if (!rateLimiterService.isAllowed(clientIp)) {
                response.setStatus(429);
                response.getWriter().write("Too many attempts. Please try again later.");
                return; 
            }
        } catch (Exception e) {
            System.err.println("Rate limiter error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}