package com.RideSharing.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.RideSharing.dto.LoginRequest;
import com.RideSharing.model.Ride;
import com.RideSharing.repository.RideRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class LoginController {

    @Autowired
    private RideRepository rideRepository;

    @PostMapping("/login")
    public ResponseEntity<List<String>> login(@RequestBody LoginRequest request) {

        String identifier = request.getIdentifier();
        String password = request.getPassword();

        if (identifier == null || identifier.trim().isEmpty() ||
            password == null || password.trim().isEmpty()) {

            return ResponseEntity.badRequest().body(List.of("Missing credentials"));
        }

        Optional<Ride> userOpt;

        if (identifier.contains("@")) {
            userOpt = rideRepository.findByEmailAndPassword(identifier.trim(), password);
        } else {
            userOpt = rideRepository.findByNameAndPassword(identifier.trim(), password);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(List.of("Invalid credentials"));
        }

        Ride user = userOpt.get();
        return ResponseEntity.ok(List.of("Login successful", user.getId().toString()));
    }
}
