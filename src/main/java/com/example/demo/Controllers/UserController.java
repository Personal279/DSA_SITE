package com.example.demo.Controllers;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Users;
import com.example.demo.Services.UserService;

import jakarta.servlet.http.HttpServletRequest;

import java.time.Duration;
import java.util.Collections;

@RestController
public class UserController {

    @Autowired 
    private StringRedisTemplate redisTemplate;

    @Autowired
    private UserService userService;
    
    @GetMapping("/")
    public String hell(){
      return userService.hello();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Users user) {
        Optional<String> jwt = userService.register(user);

    if (jwt.isPresent()) {
        return ResponseEntity.ok(Collections.singletonMap("token", jwt.get()));
    } else {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Registration failed");
    }
}


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Users user,HttpServletRequest request) {


        String ip=request.getRemoteAddr();
        
        ip="login-rate:"+ip;
        int MAX_ATTEMPTS=5;

        Duration BLOCK_DURATION=Duration.ofMinutes(1);
        Long attempts=redisTemplate.opsForValue().increment(ip);

        if(attempts==1){
            redisTemplate.expire(ip, BLOCK_DURATION);
        }

        if(attempts>MAX_ATTEMPTS){
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).
            body("Too many login attempt.Try again after 1 minute");
        }

        Optional<String> jwt = userService.login(user);

        if (jwt.isPresent()) {
            return ResponseEntity.ok(Collections.singletonMap("token", jwt.get()));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    
}
