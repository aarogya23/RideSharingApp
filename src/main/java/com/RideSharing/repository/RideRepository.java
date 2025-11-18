package com.RideSharing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.RideSharing.model.Ride;

@Repository
public interface RideRepository  extends JpaRepository<Ride, Long>{

  boolean existsByEmail(String email);
}
