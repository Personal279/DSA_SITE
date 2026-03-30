# DSA_SITE

![Project Status](https://img.shields.io/badge/status-active-success)
![Java](https://img.shields.io/badge/java-22-blue)
![Spring Boot](https://img.shields.io/badge/springboot-3.5-brightgreen)

A beautifully integrated DSA practice platform combining:
- Spring Boot backend (Java, Hibernate, JWT, OAuth2, PostgreSQL, Redis)
- React frontend (Vite, Axios, Lucide icons)
- Problem-solving with custom judge + profile tracking

---

## 🚀 Features

- User authentication (email/password + Google OAuth2)
- JWT-based session management with `userId` claim
- Problem catalog with difficulty and metadata
- Boilerplate generation per language
- In-system code execution: run/submit (hidden tests)
- Sandbox execution environment (job directory + language wrapper generation)
- Redis caching for performance
- Profile stats: solved/attempted, rank, streak, acceptance
- Recent submissions feed

---

## 🧪 Sandbox environment details

The sandbox execution flow is implemented in `JudgeService`:

- The method `run` handles sample test cases locally.
- The method `judge` handles hidden test cases and returns `ALL_TESTS_PASSED` or first failed case.
- Each request creates a temporary job directory (`createJobDir`) and generates a language wrapper:
  - Java: `Main.java` with class `Solution` and user code.
  - C++: `main.cpp` with i/o wrappers.
- Run results are managed with timeout (`TIMEOUT_SECONDS = 15`), process limits and cleanup (`deleteDir`).
- Result data is used for profile updates (`solved`, `attempted`, `acceptanceRate`).

---

## 📁 Directory structure

```
DSA_SITE/
├─ src/main/java/com/example/demo/
│  ├─ DemoApplication.java
│  ├─ SecurityConfig.java
│  ├─ CustomOAuth2SuccessHandler.java
│  ├─ JwtAuthFilter.java
│  ├─ JwtService.java
│  ├─ RedisConfig.java
│  ├─ Controllers/
│  │  ├─ UserController.java
│  │  └─ ProblemsController.java
│  ├─ Services/
│  │  ├─ ProblemService.java
│  │  ├─ UserService.java
│  │  ├─ JudgeService.java
│  │  ├─ boilerplateGenerator.java
│  │  └─ UserDetailsServiceImpl.java
│  ├─ Repository/
│  │  ├─ Problem_repo.java
│  │  └─ UserRepository.java
│  ├─ DTO/
│  │  ├─ ProblemDTO.java
│  │  ├─ TopicDTO.java
│  │  ├─ RunRequest.java
│  │  └─ MethodParam.java
│  ├─ jwt/
│  │  ├─ JwtAuthFilter.java
│  │  └─ JwtService.java
│  ├─ Users.java
│  ├─ Problem.java
│  ├─ ProblemTestCase.java
│  └─ ProblemHiddenCase.java
├─ src/main/resources/application.properties
├─ src/test/java/com/example/demo/DemoApplicationTests.java
└─ fronend/frontend/
   ├─ index.html
   ├─ package.json
   ├─ vite.config.js
   ├─ README.md
   └─ src/
      ├─ App.jsx
      ├─ main.jsx
      ├─ api/api.js
      ├─ Components/
      │  ├─ Home.jsx
      │  ├─ Login.jsx
      │  ├─ Register.jsx
      │  ├─ Problems.jsx
      │  ├─ Account.jsx
      │  ├─ ProtectedRoute.jsx
      │  └─ TokenHandler.jsx
      └─ Redux/
         ├─ LoginSlice.js
         ├─ ProblemSlice.js
         └─ store.js
```

---

## 🛠️ Backend technology stack

- Spring Boot 3.5
- Spring Security 6.5
- Hibernate/JPA
- PostgreSQL
- Redis caching
- JWT authentication
- Google OAuth2 login
- Jackson JSON serialization

---

## 🛠️ Frontend technology stack

- React 18
- Vite
- Axios for HTTP
- React Router
- Tailwind-style utility CSS (custom classes)
- Lucide icons

---

## ⚙️ Setup guide

### Backend

```bash
cd c:\Users\jagadeessh\DSA_SITE
mvn clean package
mvn spring-boot:run
```

or

```bash
./mvnw clean package
./mvnw spring-boot:run
```

### Frontend

```bash
cd c:\Users\jagadeessh\DSA_SITE\fronend\frontend
npm install
npm run dev
```

Default dev URL: `http://localhost:5173`

---

## ⚙️ Config (application.properties)

- `spring.datasource.url=jdbc:postgresql://localhost:5432/newone`
- `spring.datasource.username=postgres`
- `spring.datasource.password=harsha@123`
- `spring.jpa.hibernate.ddl-auto=update`
- `spring.jpa.show-sql=true`
- `spring.data.redis.host=localhost`
- `spring.data.redis.port=6379`
- `spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true`
- `spring.jpa.open-in-view=true`
- `spring.security.oauth2.client.registration.google.client-id=...`
- `spring.security.oauth2.client.registration.google.client-secret=...`
- `spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8080/login/oauth2/code/google`
- `spring.security.oauth2.client.provider.google.user-name-attribute=email`

---

## 🔌 Backend API endpoints

### Authentication

- `POST /register` – payload: `{ username, email, password }`
- `POST /login` – payload: `{ email, password }` returns JWT

### Problems

- `GET /api/problems` – list problems (includes difficulty)
- `GET /api/problems/{id}` – get problem detail
- `GET /api/problems/{id}/boilerplate/{language}` – boilerplate template

### Judge endpoints

- `POST /api/run` – run sample test cases
- `POST /api/submit` – evaluate hidden test cases (updates user rank/solved/attempted)

### Profile

- `GET /profile/{userId}`
- `PUT /profile/{userId}`
- `GET /profile/{userId}/recent`

---

## 🧩 Data model highlights

### Users

- `id`, `username`, `email`, `password`
- `git_link`, `Linked_link`, `portfolio`, `country`
- `solved` (int, default 0)
- `attempted` (int, default 0)
- `rank` (int, default 999999)
- `streak` (int, default 0)
- `acceptanceRate` (double, default 0.0)

### Problems

- `title`, `description`, `difficulty`, `constraints`, etc.
- `parametersJson`, `returnType`, `methodName`
- `testCases`, `hiddenCases` 

---

## 🔍 Quick troubleshooting

- `Profile not found` -> Ensure JWT token has `userId` and /profile/{userId} endpoint exists.
- `OAuth2 CORS` -> verify Google console redirect URI exactly `http://localhost:8080/login/oauth2/code/google`.
- `Problems all easy` -> problem entity `difficulty` must be set and mapped to DTO.
- `TLE` -> `JudgeService` timeout is now 15s.

---

## 🧪 Demo test plan

1. Signup + login + verify JWT in `localStorage`.
2. Load problems -> confirm difficulty values are correct.
3. Retrieve boilerplate from endpoint.
4. Run code with `/api/run`, submit with `/api/submit`.
5. Check DB updates for user stats and `acceptanceRate`.
6. View account page with solved/attempted/rank/streak.

---

## ❤️ Contributing

1. Fork repository
2. Add feature branch
3. Implement and test
4. Open PR with description, issue link

---

## 📄 License

MIT (or your chosen license)

- `pom.xml`, `mvnw`, `mvnw.cmd`
- `src/main/java/com/example/demo/`
  - `DemoApplication.java`
  - `SecurityConfig.java`
  - `CustomOAuth2SuccessHandler.java`
  - `JwtAuthFilter.java`
  - `JwtService.java`
  - `RedisConfig.java`
  - `Controllers/`
    - `UserController.java`
    - `ProblemsController.java`
  - `Services/`
    - `ProblemService.java`
    - `UserService.java`
    - `JudgeService.java`
    - `boilerplateGenerator.java`
    - `UserDetailsServiceImpl.java`
  - `Repository/`
    - `Problem_repo.java`
    - `UserRepository.java`
  - `DTO/`
    - `ProblemDTO.java`
    - `TopicDTO.java`
    - `RunRequest.java`
    - `MethodParam.java`
  - `jwt/`
    - `JwtAuthFilter.java`
    - `JwtService.java`
  - `Users.java`
  - `Problem.java`
  - `ProblemTestCase.java`
  - `ProblemHiddenCase.java`
- `src/main/resources/application.properties`
- `src/test/java/com/example/demo/DemoApplicationTests.java`
- `fronend/frontend/`
  - `index.html`, `package.json`, `vite.config.js`, `README.md`
  - `src/`
    - `App.jsx`
    - `main.jsx`
    - `api/api.js`
    - `Components/`
      - `Home.jsx`
      - `Login.jsx`
      - `Register.jsx`
      - `Problems.jsx`
      - `Account.jsx`
      - `ProtectedRoute.jsx`
      - `TokenHandler.jsx`
    - `Redux/`
      - `LoginSlice.js`, `ProblemSlice.js`, `store.js`

## Backend tech

- Spring Boot 3.5
- Spring Security 6.5
- Hibernate/JPA
- PostgreSQL
- Redis caching
- JWT authentication
- Google OAuth2 login
- Custom judge service, run/submit endpoints

## Frontend tech

- React + Vite
- Axios calls to `/api`
- Dashboard, problem list, editor, submission, profile, OAuth2 redirect handler
- Stats card and recent submission UI in `Account.jsx`

## Run backend

```bash
cd c:\Users\jagadeessh\DSA_SITE
mvn clean package
mvn spring-boot:run
```

Or:

```bash
./mvnw clean package
./mvnw spring-boot:run
```

## Run frontend

```bash
cd c:\Users\jagadeessh\DSA_SITE\fronend\frontend
npm install
npm run dev
```

Default: `http://localhost:5173`

## Config (application.properties)

- `spring.datasource.url=jdbc:postgresql://localhost:5432/newone`
- `spring.jpa.hibernate.ddl-auto=update`
- Redis settings
- OAuth2 Google client id/secret/redirect third-party config
- `spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true`

## Backend API endpoints

### Auth

- `POST /register`
- `POST /login` (JWT returned)

### Problem listing + details

- `GET /api/problems`
- `GET /api/problems/{id}`
- `GET /api/problems/{id}/boilerplate/{language}`

### Code execution

- `POST /api/run` (sample tests)
- `POST /api/submit` (hidden tests + stats update)

### Profile

- `GET /profile/{userId}`
- `PUT /profile/{userId}`
- `GET /profile/{userId}/recent` (placeholder)

## Users fields

- `username`, `email`, `git_link`, `Linked_link`, `portfolio`, `country`
- `solved` (int)
- `attempted` (int)
- `rank` (int)
- `streak` (int)
- `acceptanceRate` (double)

## Notes

- Ensure JWT includes `userId` claim
- Profile stats may require wiring in Controller + JudgeService
- OAuth2 redirect URI must match Google console and app config

## Manual test

1. Register/login; verify token stored.
2. Load Home + Problems; ensure difficulty displays.
3. Run/submit code.
4. Inspect DB user row for solved, attempted, acceptanceRate.
5. Visit Account page and confirm stats + recent submissions.
