package com.RideSharing.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.RideSharing.model.Ride;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {

	boolean existsByEmail(String email);
	boolean existsByName(String name);

	Optional<Ride> findByEmail(String email);
	Optional<Ride> findByName(String name);
	Optional<Ride> findByEmailAndPassword(String trim, String password);
	Optional<Ride> findByNameAndPassword(String trim, String password);


}