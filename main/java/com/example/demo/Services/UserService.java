package com.example.demo.Services;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.demo.Users;
import com.example.demo.Repository.UserRepository;
import com.example.demo.jwt.JwtService;
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder bcrypt;

    
    @Autowired
    private JwtService jwtService;
    public String hello() {
        return "Harsha";
    }

   public Optional<String> register(Users user) {
    user.setPassword(bcrypt.encode(user.getPassword()));
    
    try {
        Users savedUser = userRepository.save(user);
        
        String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getId()); 
        return Optional.of(token);
    } catch (Exception e) {
        return Optional.empty();
    }
}

public Optional<String> login(Users user) {
    Optional<Users> foundUser = userRepository.findByEmail(user.getEmail());
    
    System.out.println("Input Email: " + user.getEmail());
    System.out.println("Input Password: " + user.getPassword());
        
    if (foundUser.isPresent()) {
        if (bcrypt.matches(user.getPassword(), foundUser.get().getPassword())) {
            System.out.println("Match Success!");
            return Optional.of(jwtService.generateToken(foundUser.get().getEmail(), foundUser.get().getId()));
        } else {
            System.out.println("Match Failed: Password mismatch.");
        }
    } else {
        System.out.println("Match Failed: User not found.");
    }
    return Optional.empty();
}
}