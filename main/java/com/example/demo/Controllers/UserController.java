package com.example.demo.Controllers;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.demo.Users;
import com.example.demo.DTO.RunRequest;
import com.example.demo.Services.UserService;
import com.example.demo.Services.JudgeService;
import com.example.demo.Repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;

import java.time.Duration;
import java.util.Collections;

@RestController
@CrossOrigin("http://localhost:5173")
public class UserController {

    @Autowired 
    private StringRedisTemplate redisTemplate;

    @Autowired
    private UserService userService;
    
    @Autowired
    private JudgeService judgeService;
    
    @Autowired
    private UserRepository userRepository;
    
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
public ResponseEntity<?> login(@RequestBody Users user, HttpServletRequest request) {
    String ip = "login-rate:" + request.getRemoteAddr();
    int MAX_ATTEMPTS = 5;
    Duration BLOCK_DURATION = Duration.ofMinutes(1);
    
    Long attempts = redisTemplate.opsForValue().increment(ip);

    if (attempts != null && attempts == 1) {
        redisTemplate.expire(ip, BLOCK_DURATION);
    }

    if (attempts != null && attempts > MAX_ATTEMPTS) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body("Too many login attempts. Try again after 1 minute");
    }

    Optional<String> jwt = userService.login(user);

    if (jwt.isPresent()) {
        redisTemplate.delete(ip);
        return ResponseEntity.ok(Collections.singletonMap("token", jwt.get()));
    } else {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }
}

    @PostMapping("/api/run")
    public String runTests(@RequestBody RunRequest request) throws Exception {
        return judgeService.run(request);
    }
    
    @PostMapping("/api/submit")
    public String submit(@RequestBody RunRequest request) throws Exception {
        return judgeService.judge(request);
    }
    
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Long userId) {
        Optional<Users> user = userRepository.findById(userId);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
    
    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody Users userUpdates) {
        Optional<Users> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            Users user = userOpt.get();
            if (userUpdates.getUsername() != null) user.setUsername(userUpdates.getUsername());
            if (userUpdates.getEmail() != null) user.setEmail(userUpdates.getEmail());
            if (userUpdates.getGit_link() != null) user.setGit_link(userUpdates.getGit_link());
            if (userUpdates.getLinked_link() != null) user.setLinked_link(userUpdates.getLinked_link());
            
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
    
    @GetMapping("/profile/{userId}/recent")
    public ResponseEntity<?> getRecentSubmissions(@PathVariable Long userId) {
        return ResponseEntity.ok(Collections.emptyList());
    }
    
}