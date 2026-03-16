package com.example.auth.service;

import com.example.auth.dto.*;
import com.example.auth.entity.User;
import com.example.auth.repository.UserRepository;
import com.example.auth.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtUtil = jwtUtil;
    }

    public void register(RegisterRequest req) {
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }
        Optional<User> existing = userRepository.findByEmail(req.getEmail());
        if (existing.isPresent()) throw new RuntimeException("Email already registered");

        User u = new User();
        u.setFullName(req.getFullName());
        u.setEmail(req.getEmail());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        userRepository.save(u);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail()).orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) throw new RuntimeException("Invalid credentials");
        String token = jwtUtil.generateToken(String.valueOf(user.getId()));
        return new AuthResponse(token, user.getEmail());
    }

    public void forgotPassword(ForgotRequest req) {
        Optional<User> uo = userRepository.findByEmail(req.getEmail());
        if (!uo.isPresent()) return; // do not reveal existence
        User u = uo.get();
        String token = UUID.randomUUID().toString();
        u.setResetToken(token);
        u.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(u);
        // TODO: send email with token link - omitted here. Return token in logs for dev.
        System.out.println("Password reset token for " + u.getEmail() + ": " + token);
    }

    public void resetPassword(ResetPasswordRequest req) {
        Optional<User> uo = userRepository.findAll().stream().filter(x -> req.getToken().equals(x.getResetToken())).findFirst();
        if (!uo.isPresent()) throw new RuntimeException("Invalid or expired token");
        User u = uo.get();
        if (u.getResetTokenExpiry() == null || u.getResetTokenExpiry().isBefore(LocalDateTime.now())) throw new RuntimeException("Invalid or expired token");
        if (req.getNewPassword() == null || req.getNewPassword().length() < 6) throw new RuntimeException("Password must be at least 6 characters");
        u.setPassword(passwordEncoder.encode(req.getNewPassword()));
        u.setResetToken(null);
        u.setResetTokenExpiry(null);
        userRepository.save(u);
    }
}
