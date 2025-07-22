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
        userRepository.save(user);
        String token=jwtService.generateToken(user.getUsername());
        return Optional.of(token);
    } catch (Exception e) {
        return Optional.empty();
    }
}


     public Optional<String> login(Users user) {
        Optional<Users> dbUser = userRepository.findByUsername(user.getUsername());
        if (dbUser.isPresent()) {
            if (bcrypt.matches(user.getPassword(), dbUser.get().getPassword())) {
                String token = jwtService.generateToken(user.getUsername());
                return Optional.of(token);
            }
        }

        return Optional.empty(); 
    }

}

