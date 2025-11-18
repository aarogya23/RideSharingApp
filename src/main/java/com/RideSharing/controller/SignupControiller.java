package com.RideSharing.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.RideSharing.model.Ride;
import com.RideSharing.repository.RideRepository;

@RestController
@RequestMapping("/api")
public class SignupControiller {

    @Autowired
    private RideRepository rideRepository;

    @PostMapping("/signup")
    public ResponseEntity<List<String>> signup(@RequestBody Ride ride) {
        String name = ride.getName();

        String email = ride.getEmail();

        String password = ride.getPassword();

        // the part of email encryption is going to be done by tomorrow

        if (rideRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(List.of("Email already exists"));
        }

        Ride savedRide = rideRepository.save(ride);
        return ResponseEntity.ok(List.of("User registered successfully", savedRide.getId().toString()));
    }
}