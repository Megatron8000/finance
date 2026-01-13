package org.example.finance.auth;

import lombok.RequiredArgsConstructor;
import org.example.finance.user.User;
import org.example.finance.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final JwtService jwt;
    private final PasswordEncoder encoder;

    @PostMapping("/register")
    public void register(@RequestBody AuthRequest req) {
        User user = new User();
        user.setEmail(req.email());
        user.setPassword(encoder.encode(req.password()));
        userRepo.save(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody AuthRequest req) {
        User user = userRepo.findByEmail(req.email())
                .orElseThrow();
        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        return jwt.generateToken(user.getEmail());
    }
}

record AuthRequest(String email, String password) {}
