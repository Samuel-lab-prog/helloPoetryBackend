# Social Media Application — Backend

This repository contains the **backend application** of a poetry related social
media project.  
It is responsible for handling data storage, user authentication, API endpoints,
and business logic.

This project is built using a Domain Driven Design (DDD) approach, ensuring a
clear separation of concerns and scalability. The backend is developed with
**TypeScript**, **Bun** as the runtime, and **Elysia** as the web framework.

The choosen architecture is a **modular monolith**, allowing for easy
maintenance and future growth to microservices if needed.

---

## Tech Stack

- **TypeScript** — main programming language, ensuring type safety and better DX
- **Bun** — JavaScript runtime for building scalable backend applications
- **Elysia** — web framework for building API endpoints

---

## Main Dependencies

- **Prisma** — efficient and scalable database ORM
- **JWT** — stateless user authentication
- **bcrypt** — secure password hashing
- **pino** — high-performance logging

---

## Project Structure (Overview)

The project follows a **domain driven architecture**, aiming for better
scalability and separation of concerns. It's so simple, that you can just open
folders and you will understand what is going on.

```plaintext
src/
  ├── domains/
  │   ├── users/
  │   ├── posts/
  │   └── auth/
  ├── prisma/
  │   ├── generated/
  │   ├── migrations/
  │   └── seeds/
  │   └── client.ts
  ├── utils/
  │   ├── plugins/
  │   └── ...other funcitons and classes
  └── server.ts
```

## How to Run Locally

### 1.Clone the repository

```
git clone https://github.com/yourusername/helloPoetryBackend.git
cd helloPoetryBackend
```

### 2.Install dependencies

```
bun install
```

### 3.Run the local development server

```
bun run dev
```

## Code Quality & Best Practices

This project adopts several conventions and patterns to keep the codebase
**clean, maintainable, and easy to scale**.

### General Practices

- Strong typing with TypeScript
- Reusable and composable components
- Feature-based folder organization
- Clear separation between UI, logic, and data layers
- Controlled side effects using React Query and custom hooks
- Predictable state management and data flow
- Consistent naming conventions across the codebase

---

## Commit Message Guidelines

This repository follows a **conventional commit pattern** to maintain a clean,
readable, and meaningful commit history.

### Commit Prefixes

Use a prefix for every commit:

- `feat:` — new features
- `fix:` — bug fixes
- `refactor:` — code restructuring without changing behavior
- `docs:` — documentation updates
- `style:` — formatting or stylistic changes (no logic impact)
- `test:` — adding or updating tests
- `chore:` — tooling, configuration, or maintenance tasks

### Commit Rules

1. **One purpose per commit**  
   Each commit should solve a single, well-defined problem.

2. **Keep commits small and focused**  
   Avoid large commits that mix unrelated changes.  
   Prefer multiple small commits over one large commit.

3. **Write meaningful commit messages**

   **❌ Bad** fix stuff **✅ Good** fix: resolve issue with user login on Safari

---

## Notes

- This repository contains **only the backend** of the application.
- The entire project is managed by myself as a solo developer.
- The frontend is maintained in a **separate repository**. The link below will
  redirect you to it:
- [helloPoetry Frontend Repository](https://github.com/Samuel-lab-prog/helloPoetryFrontend)
- Contributions, suggestions, and improvements are welcome! Feel free to open
  issues or pull requests.

---
