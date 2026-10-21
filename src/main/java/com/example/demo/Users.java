package com.example.demo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
@Table(name = "spring_table")
@Data
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private int totalSolved;
    private int easySolved;
    private int mediumSolved;
    private int hardSolved;
    @Column(name = "email")
    private String email;

    private String Linked_link;
    private String git_link;
    private String portfolio;
    private String country;
}






































