package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.Problem;

@Repository
public interface Problem_repo extends JpaRepository<Problem, Long> {
}