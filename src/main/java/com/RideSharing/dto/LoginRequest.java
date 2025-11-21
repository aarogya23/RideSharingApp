package com.RideSharing.dto;

public class LoginRequest {

    private String identifier;
    private String password;

    // Public no-arg constructor (required by Spring)
    public LoginRequest() {
    }

    // Parameterized constructor
    public LoginRequest(String identifier, String password) {
        this.identifier = identifier;
        this.password = password;
    }

    // Getter and Setter
    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
