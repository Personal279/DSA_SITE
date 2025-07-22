package com.example.demo.Services;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.Problem;
import com.example.demo.ProblemDTO;
import com.example.demo.Repository.Problem_repo;

import jakarta.transaction.Transactional;

@Service
public class ProblemService {

    @Autowired
    private Problem_repo problem_repo;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String PROBLEM_CACHE_KEY = "allProblems";

    @Transactional
    public List<Problem> get() {
        List<ProblemDTO> cachedDTOs = (List<ProblemDTO>) redisTemplate.opsForValue().get(PROBLEM_CACHE_KEY);

        if (cachedDTOs != null) {
            return cachedDTOs.stream().map(dto -> {
                Problem problem = new Problem();
                problem.setId(dto.getId());
                problem.setTitle(dto.getTitle());
                problem.setDescription(dto.getDescription());
                problem.setTopics(dto.getTopics());
                problem.setTestCases(dto.getTestCases());
                problem.setHiddenCases(dto.getHiddenCases());
                problem.setSolved(dto.isSolved());
                problem.setTimeSpent(dto.getTimeSpent());
                return problem;
            }).collect(Collectors.toList());
        }

        List<Problem> dbProblems = problem_repo.findAll();

        List<ProblemDTO> dtoList = dbProblems.stream().map(p -> new ProblemDTO(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                new ArrayList<>(p.getTopics()),
                new ArrayList<>(p.getTestCases()),
                new ArrayList<>(p.getHiddenCases()),
                p.isSolved(),
                p.getTimeSpent()
        )).collect(Collectors.toList());


          redisTemplate.opsForValue().set(PROBLEM_CACHE_KEY, dtoList, Duration.ofHours(1));

        return dbProblems;
    }
}

