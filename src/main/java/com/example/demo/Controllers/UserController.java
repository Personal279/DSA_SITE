
package com.example.demo.Controllers;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.DTO.RunRequest;
import com.example.demo.DTO.SubmissionStatusResponse;
import com.example.demo.Problem;
import com.example.demo.Repository.Problem_repo;
import com.example.demo.Repository.UserRepository;
import com.example.demo.Repository.UserSubmissionRepository;
import com.example.demo.Services.JudgeService;
import com.example.demo.Services.SubmissionQueueService;
import com.example.demo.Services.UserService;
import com.example.demo.UserSubmission;
import com.example.demo.Users;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private UserSubmissionRepository userSubmissionRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private JudgeService judgeService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Problem_repo problemRepository;

    @Autowired
    private SubmissionQueueService submissionQueueService;

    @GetMapping("/")
    public String hell() {
        return userService.hello();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Users user) {
        Optional<String> jwt = userService.register(user);

        if (jwt.isPresent()) {
            return ResponseEntity.ok(
                    Collections.singletonMap("token", jwt.get())
            );
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Registration failed");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Users user,
            HttpServletRequest request) {

        String key = "login-rate:" + request.getRemoteAddr();
        int maxAttempts = 5;
        Duration blockDuration = Duration.ofMinutes(1);

        Long attempts = redisTemplate.opsForValue().increment(key);

        if (attempts != null && attempts == 1) {
            redisTemplate.expire(key, blockDuration);
        }

        if (attempts != null && attempts > maxAttempts) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many login attempts. Try again after 1 minute");
        }

        Optional<String> jwt = userService.login(user);

        if (jwt.isPresent()) {
            redisTemplate.delete(key);

            return ResponseEntity.ok(
                    Collections.singletonMap("token", jwt.get())
            );
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid credentials");
    }

    @PostMapping("/api/run")
    public ResponseEntity<String> runTests(
            @RequestBody RunRequest request) throws Exception {

        // Sample test cases remain synchronous.
        return ResponseEntity.ok(judgeService.run(request));
    }

    @PostMapping("/api/submit")
    public ResponseEntity<?> submit(
            @RequestBody RunRequest request,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("USER_NOT_LOGGED_IN");
        }

        Optional<Users> userOpt =
                userRepository.findByEmail(authentication.getName());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("USER_NOT_FOUND");
        }

        if (request.getProblemId() == null
                || request.getLanguage() == null
                || request.getLanguage().isBlank()
                || request.getCode() == null
                || request.getCode().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Problem ID, language and code are required");
        }

        Optional<Problem> problemOpt =
                problemRepository.findById(request.getProblemId());

        if (problemOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("PROBLEM_NOT_FOUND");
        }

        Users user = userOpt.get();
        Problem problem = problemOpt.get();

        // Persist the submission before adding its ID to Redis.
        UserSubmission submission = new UserSubmission(
                user.getId(),
                problem.getTitle(),
                "QUEUED"
        );

        submission.setProblemId(problem.getId());
        submission.setLanguage(request.getLanguage());
        submission.setSourceCode(request.getCode());
        submission.setResultMessage("Waiting in judge queue");

        UserSubmission savedSubmission =
                userSubmissionRepository.save(submission);

        try {
            submissionQueueService.enqueue(savedSubmission.getId());
        } catch (Exception e) {
            System.err.println(
                    "Failed to queue submission "
                            + savedSubmission.getId()
                            + ": " + e.getMessage()
            );

            savedSubmission.setStatus("QUEUE_ERROR");
            savedSubmission.setResultMessage(
                    "Could not add submission to the judge queue"
            );

            userSubmissionRepository.save(savedSubmission);

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("JUDGE_QUEUE_UNAVAILABLE");
        }

        // Return immediately; the worker performs the actual judging.
        return ResponseEntity.accepted()
                .body(SubmissionStatusResponse.from(savedSubmission));
    }

    /**
     * Get the status and result of a submission owned by the authenticated user.
     */
    @GetMapping("/api/submissions/{submissionId}")
    public ResponseEntity<?> getSubmissionStatus(
            @PathVariable Long submissionId,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("USER_NOT_LOGGED_IN");
        }

        Optional<Users> userOpt =
                userRepository.findByEmail(authentication.getName());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("USER_NOT_FOUND");
        }

        Optional<UserSubmission> submissionOpt =
                userSubmissionRepository.findByIdAndUserId(
                        submissionId,
                        userOpt.get().getId()
                );

        if (submissionOpt.isEmpty()) {
            // Do not reveal whether another user's submission exists.
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(
                SubmissionStatusResponse.from(submissionOpt.get())
        );
    }

    /**
     * Return a profile only to its owner.
     */
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(
            @PathVariable Long userId,
            Authentication authentication) {

        Optional<Users> currentUser =
                getAuthenticatedUser(authentication);

        if (currentUser.isEmpty()
                || !currentUser.get().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Profile not found");
        }

        return ResponseEntity.ok(currentUser.get());
    }

    /**
     * Allow a user to update only their own profile.
     * Email changes are excluded because email is the JWT identity.
     */
    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long userId,
            @RequestBody Users userUpdates,
            Authentication authentication) {

        Optional<Users> currentUser =
                getAuthenticatedUser(authentication);

        if (currentUser.isEmpty()
                || !currentUser.get().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Profile not found");
        }

        Users user = currentUser.get();

        if (userUpdates.getUsername() != null) {
            user.setUsername(userUpdates.getUsername());
        }

        if (userUpdates.getGit_link() != null) {
            user.setGit_link(userUpdates.getGit_link());
        }

        if (userUpdates.getLinked_link() != null) {
            user.setLinked_link(userUpdates.getLinked_link());
        }

        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    /**
     * Return recent submissions only to the owner of the profile.
     */
    @GetMapping("/profile/{userId}/recent")
    public ResponseEntity<?> getRecentSubmissions(
            @PathVariable String userId,
            Authentication authentication) {

        Long id;

        try {
            id = Long.parseLong(userId);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body("Invalid User ID format");
        }

        Optional<Users> currentUser =
                getAuthenticatedUser(authentication);

        if (currentUser.isEmpty()
                || !currentUser.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Profile not found");
        }

        List<UserSubmission> submissions =
                userSubmissionRepository
                        .findTop5ByUserIdOrderBySubmittedAtDesc(id);

        if (submissions == null) {
            submissions = Collections.emptyList();
        }

        return ResponseEntity.ok(submissions);
    }

    /**
     * Resolve the current user from Spring Security's authenticated principal.
     */
    private Optional<Users> getAuthenticatedUser(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            return Optional.empty();
        }

        return userRepository.findByEmail(authentication.getName());
    }
}
