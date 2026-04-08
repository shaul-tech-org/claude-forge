<?php

declare(strict_types=1);

namespace App\Services\Recommendation;

use App\DTOs\Recommendation\RuleTemplate;
use App\DTOs\Recommendation\SkillTemplate;
use App\DTOs\Recommendation\TechStack;

final class TechStackRegistry
{
    /** @var array<string, array{stack: TechStack, rules: RuleTemplate[], skills: SkillTemplate[]}> */
    private array $registry = [];

    public function __construct()
    {
        $this->registerAll();
    }

    /**
     * @return TechStack[]
     */
    public function allStacks(): array
    {
        return array_map(
            static fn (array $entry): TechStack => $entry['stack'],
            array_values($this->registry),
        );
    }

    public function findStack(string $id): ?TechStack
    {
        return $this->registry[$id]['stack'] ?? null;
    }

    /**
     * @return RuleTemplate[]
     */
    public function rulesFor(string $id): array
    {
        return $this->registry[$id]['rules'] ?? [];
    }

    /**
     * @return SkillTemplate[]
     */
    public function skillsFor(string $id): array
    {
        return $this->registry[$id]['skills'] ?? [];
    }

    /**
     * Get detailed rules from the RulesDatabase for a specific stack.
     *
     * These are comprehensive, documentation-quality rules with DO/DON'T patterns,
     * significantly more detailed than the basic templates in rulesFor().
     *
     * @return RuleTemplate[]
     */
    public function getDetailedRules(string $stackId): array
    {
        return RulesDatabase::forStack($stackId);
    }

    private function registerAll(): void
    {
        $this->registerFrontendStacks();
        $this->registerBackendStacks();
        $this->registerLanguageStacks();
        $this->registerInfraStacks();
    }

    private function register(
        TechStack $stack,
        array $rules = [],
        array $skills = [],
    ): void {
        $this->registry[$stack->id] = [
            'stack' => $stack,
            'rules' => $rules,
            'skills' => $skills,
        ];
    }

    private function registerFrontendStacks(): void
    {
        $this->register(
            stack: new TechStack(
                id: 'react',
                name: 'React',
                category: 'frontend',
                implies: ['typescript', 'jsx'],
            ),
            rules: [
                new RuleTemplate(
                    label: 'React Best Practices',
                    category: 'frontend/react',
                    paths: ['**/*.tsx', '**/*.jsx'],
                    content: <<<'MD'
                    # React Best Practices

                    - Use functional components exclusively; avoid class components
                    - Extract reusable logic into custom hooks (`use` prefix)
                    - Wrap expensive renders with `React.memo()` and use `useMemo`/`useCallback` appropriately
                    - Keep components small and single-responsibility (< 150 lines)
                    - Colocate state as close to where it is used as possible
                    - Use `key` props correctly in lists (never use array index for dynamic lists)
                    - Prefer controlled components for form inputs
                    - Avoid inline object/array literals in JSX props (causes unnecessary re-renders)
                    - Use error boundaries to catch rendering errors gracefully
                    - Lazy-load heavy components with `React.lazy()` and `Suspense`
                    MD,
                ),
            ],
            skills: [
                new SkillTemplate(
                    name: 'react-component',
                    description: 'Generate a new React functional component with TypeScript',
                    userInvocable: true,
                    instructions: 'Create a new React functional component. Use TypeScript interfaces for props. Include React.memo if the component receives complex props. Add JSDoc comments for the component and its props.',
                ),
            ],
        );

        $this->register(
            stack: new TechStack(
                id: 'vue',
                name: 'Vue.js',
                category: 'frontend',
                implies: ['typescript'],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Vue.js Best Practices',
                    category: 'frontend/vue',
                    paths: ['**/*.vue', '**/*.ts'],
                    content: <<<'MD'
                    # Vue.js Best Practices

                    - Use Composition API (`<script setup>`) over Options API
                    - Define props with TypeScript interfaces using `defineProps<T>()`
                    - Use `defineEmits<T>()` for typed event emissions
                    - Prefer `ref()` for primitives and `reactive()` for objects
                    - Extract reusable logic into composables (`use` prefix)
                    - Use `computed()` for derived state instead of watchers
                    - Avoid mutating props directly; emit events to parent
                    - Use `v-memo` for expensive list rendering optimizations
                    - Keep templates readable; extract complex logic into computed properties
                    - Use `Teleport` for modals and overlays
                    MD,
                ),
            ],
            skills: [
                new SkillTemplate(
                    name: 'vue-component',
                    description: 'Generate a new Vue 3 SFC with Composition API',
                    userInvocable: true,
                    instructions: 'Create a new Vue 3 Single File Component using <script setup lang="ts">. Define typed props and emits. Include scoped styles.',
                ),
            ],
        );

        $this->register(
            stack: new TechStack(
                id: 'nextjs',
                name: 'Next.js',
                category: 'frontend',
                implies: ['react', 'typescript'],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Next.js Best Practices',
                    category: 'frontend/nextjs',
                    paths: ['**/*.tsx', '**/*.ts', 'app/**/*', 'pages/**/*'],
                    content: <<<'MD'
                    # Next.js Best Practices

                    - Use App Router (`app/`) over Pages Router for new projects
                    - Default to Server Components; add `'use client'` only when needed
                    - Use `loading.tsx` and `error.tsx` for route-level UX
                    - Prefer `next/image` for optimized image loading
                    - Use `next/link` for client-side navigation
                    - Fetch data in Server Components with `async/await` (no useEffect for data)
                    - Use Route Handlers (`route.ts`) for API endpoints
                    - Apply metadata exports for SEO (`generateMetadata`)
                    - Use `Suspense` boundaries for streaming and progressive rendering
                    - Validate environment variables at build time with `env.mjs` or `t3-env`
                    MD,
                ),
            ],
            skills: [
                new SkillTemplate(
                    name: 'nextjs-page',
                    description: 'Generate a new Next.js page with App Router conventions',
                    userInvocable: true,
                    instructions: 'Create a Next.js App Router page. Use Server Components by default. Include generateMetadata for SEO. Add loading.tsx and error.tsx if appropriate.',
                ),
            ],
        );

        $this->register(
            stack: new TechStack(
                id: 'svelte',
                name: 'Svelte',
                category: 'frontend',
                implies: ['typescript'],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Svelte Best Practices',
                    category: 'frontend/svelte',
                    paths: ['**/*.svelte', '**/*.ts'],
                    content: <<<'MD'
                    # Svelte Best Practices

                    - Use SvelteKit for full-stack applications
                    - Prefer `$state` rune over legacy reactive declarations (Svelte 5+)
                    - Use `$derived` for computed values
                    - Keep components focused and small
                    - Use `{#each}` blocks with keyed items for lists
                    - Prefer stores for shared state across components
                    - Use `<script lang="ts">` for TypeScript support
                    - Leverage Svelte actions for reusable DOM behaviors
                    - Use `$effect` for side effects instead of `onMount` where appropriate
                    - Colocate styles within components using scoped `<style>`
                    MD,
                ),
            ],
            skills: [],
        );

        $this->register(
            stack: new TechStack(
                id: 'tailwind',
                name: 'Tailwind CSS',
                category: 'frontend',
                implies: [],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Tailwind CSS Best Practices',
                    category: 'frontend/tailwind',
                    paths: ['**/*.tsx', '**/*.jsx', '**/*.vue', '**/*.html'],
                    content: <<<'MD'
                    # Tailwind CSS Best Practices

                    - Use utility classes directly; avoid `@apply` except for highly reused patterns
                    - Group related utilities logically (layout, spacing, typography, colors)
                    - Use design tokens via `tailwind.config` for consistent spacing/colors
                    - Prefer responsive prefixes (`sm:`, `md:`, `lg:`) over custom media queries
                    - Use `cn()` or `clsx()` for conditional class composition
                    - Extract repeated class combinations into reusable components, not CSS
                    - Use `dark:` variant for dark mode support
                    - Avoid arbitrary values (`[123px]`) when a design token exists
                    - Keep class strings readable; split across lines if exceeding ~80 characters
                    - Purge unused styles in production (enabled by default in v3+)
                    MD,
                ),
            ],
            skills: [],
        );

        // JSX is an implied stack, no direct user selection expected
        $this->register(
            stack: new TechStack(
                id: 'jsx',
                name: 'JSX',
                category: 'frontend',
                implies: [],
            ),
            rules: [
                new RuleTemplate(
                    label: 'JSX Conventions',
                    category: 'frontend/jsx',
                    paths: ['**/*.tsx', '**/*.jsx'],
                    content: <<<'MD'
                    # JSX Conventions

                    - Use self-closing tags for components without children (`<Component />`)
                    - Prefer fragment shorthand (`<>...</>`) over `<React.Fragment>`
                    - Avoid complex expressions in JSX; extract to variables or functions
                    - Use ternary for simple conditionals; extract complex conditions to early returns
                    - Always provide `alt` text for `<img>` tags
                    MD,
                ),
            ],
            skills: [],
        );
    }

    private function registerBackendStacks(): void
    {
        $this->register(
            stack: new TechStack(
                id: 'laravel',
                name: 'Laravel',
                category: 'backend',
                implies: ['php'],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Laravel Best Practices',
                    category: 'backend/laravel',
                    paths: ['**/*.php'],
                    content: <<<'MD'
                    # Laravel Best Practices

                    - Follow PSR-12 coding standard with `declare(strict_types=1)`
                    - Use Service pattern: thin controllers delegate to service classes
                    - Always use FormRequest classes for request validation
                    - Use Eloquent eager loading (`with()`) to prevent N+1 queries
                    - Apply Route Model Binding for cleaner controller signatures
                    - Use API Resources for consistent response formatting
                    - Manage transactions in Service layer (`DB::transaction()`)
                    - Access config via `config()` helper, never `env()` directly
                    - Use `php artisan make:` generators to maintain project structure
                    - Write Pest/PHPUnit feature tests for every endpoint
                    MD,
                ),
            ],
            skills: [
                new SkillTemplate(
                    name: 'laravel-crud',
                    description: 'Generate Laravel CRUD (Controller, Service, FormRequest, Resource, Migration)',
                    userInvocable: true,
                    instructions: 'Generate a complete Laravel CRUD setup: Migration, Model, Service, Controller (thin), FormRequest, and API Resource. Use strict_types, type hints, and PSR-12. Include eager loading in queries and DB::transaction in service methods.',
                ),
            ],
        );

        $this->register(
            stack: new TechStack(
                id: 'express',
                name: 'Express.js',
                category: 'backend',
                implies: ['typescript'],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Express.js Best Practices',
                    category: 'backend/express',
                    paths: ['**/*.ts', '**/*.js'],
                    content: <<<'MD'
                    # Express.js Best Practices

                    - Use TypeScript for type safety across routes and middleware
                    - Structure routes with `express.Router()` by domain
                    - Validate request bodies with `zod` or `joi` middleware
                    - Use async error handling middleware (catch unhandled rejections)
                    - Apply `helmet` for security headers
                    - Use `cors` middleware with explicit origin configuration
                    - Keep route handlers thin; delegate logic to service/controller layer
                    - Use environment-based config with `dotenv` and validation
                    - Apply rate limiting on public endpoints
                    - Use structured logging (`pino` or `winston`)
                    MD,
                ),
            ],
            skills: [
                new SkillTemplate(
                    name: 'express-route',
                    description: 'Generate an Express route with validation and error handling',
                    userInvocable: true,
                    instructions: 'Create an Express route module with TypeScript. Include request validation with zod, async error wrapper, and service layer delegation.',
                ),
            ],
        );

        $this->register(
            stack: new TechStack(
                id: 'django',
                name: 'Django',
                category: 'backend',
                implies: ['python'],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Django Best Practices',
                    category: 'backend/django',
                    paths: ['**/*.py'],
                    content: <<<'MD'
                    # Django Best Practices

                    - Use class-based views (CBVs) for standard CRUD; function-based for custom logic
                    - Define models with explicit `Meta` class (ordering, constraints, indexes)
                    - Use `select_related()` and `prefetch_related()` to prevent N+1 queries
                    - Validate input with Django Forms or DRF Serializers
                    - Use Django REST Framework for API development
                    - Apply database migrations atomically; never edit existing migrations
                    - Use `django.conf.settings` for configuration, never `os.environ` directly
                    - Write tests with `pytest-django` and factory_boy
                    - Keep business logic in service modules, not in views or models
                    - Use `transaction.atomic()` for multi-step database operations
                    MD,
                ),
            ],
            skills: [],
        );

        $this->register(
            stack: new TechStack(
                id: 'fastapi',
                name: 'FastAPI',
                category: 'backend',
                implies: ['python'],
            ),
            rules: [
                new RuleTemplate(
                    label: 'FastAPI Best Practices',
                    category: 'backend/fastapi',
                    paths: ['**/*.py'],
                    content: <<<'MD'
                    # FastAPI Best Practices

                    - Use Pydantic models for request/response validation and serialization
                    - Define explicit status codes and response models on each endpoint
                    - Use dependency injection (`Depends()`) for shared logic (auth, DB sessions)
                    - Structure project with routers by domain (`APIRouter`)
                    - Use `async def` for I/O-bound endpoints; `def` for CPU-bound
                    - Apply middleware for CORS, authentication, and request logging
                    - Use `BackgroundTasks` for non-blocking operations
                    - Handle errors with custom exception handlers
                    - Write tests with `httpx.AsyncClient` and `pytest-asyncio`
                    - Document API with OpenAPI metadata (tags, descriptions, examples)
                    MD,
                ),
            ],
            skills: [],
        );

        $this->register(
            stack: new TechStack(
                id: 'spring',
                name: 'Spring Boot',
                category: 'backend',
                implies: ['java'],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Spring Boot Best Practices',
                    category: 'backend/spring',
                    paths: ['**/*.java', '**/*.kt'],
                    content: <<<'MD'
                    # Spring Boot Best Practices

                    - Use constructor injection over field injection (`@Autowired` on fields)
                    - Apply layered architecture: Controller -> Service -> Repository
                    - Use `@Valid` with Jakarta Bean Validation for request validation
                    - Define DTOs for request/response; never expose entities directly
                    - Use `@Transactional` on service methods for database operations
                    - Configure profiles (`application-{profile}.yml`) for environment separation
                    - Use Spring Data JPA specifications or QueryDSL for complex queries
                    - Apply `@RestControllerAdvice` for global exception handling
                    - Write tests with `@SpringBootTest` and `MockMvc`
                    - Use Lombok sparingly; prefer Java records for DTOs
                    MD,
                ),
            ],
            skills: [],
        );
    }

    private function registerLanguageStacks(): void
    {
        $this->register(
            stack: new TechStack(
                id: 'typescript',
                name: 'TypeScript',
                category: 'language',
                implies: [],
            ),
            rules: [
                new RuleTemplate(
                    label: 'TypeScript Best Practices',
                    category: 'language/typescript',
                    paths: ['**/*.ts', '**/*.tsx'],
                    content: <<<'MD'
                    # TypeScript Best Practices

                    - Enable `strict: true` in tsconfig.json; never use `any`
                    - Use explicit type annotations for function parameters and return types
                    - Prefer `interface` for object shapes; use `type` for unions and intersections
                    - Use `async/await` over `.then()` chains for readability
                    - Leverage discriminated unions for state modeling
                    - Use `readonly` for immutable properties and arrays
                    - Prefer `unknown` over `any` when type is uncertain; narrow with type guards
                    - Use `satisfies` operator for type-safe object literals
                    - Avoid type assertions (`as`); prefer type narrowing
                    - Use `Record<K, V>`, `Pick`, `Omit`, and mapped types for type transformations
                    MD,
                ),
            ],
            skills: [
                new SkillTemplate(
                    name: 'ts-interface',
                    description: 'Generate TypeScript interfaces from a data description',
                    userInvocable: true,
                    instructions: 'Generate TypeScript interfaces with proper readonly modifiers, optional fields marked with ?, and JSDoc comments. Use discriminated unions where applicable.',
                ),
            ],
        );

        $this->register(
            stack: new TechStack(
                id: 'php',
                name: 'PHP',
                category: 'language',
                implies: [],
            ),
            rules: [
                new RuleTemplate(
                    label: 'PHP Best Practices',
                    category: 'language/php',
                    paths: ['**/*.php'],
                    content: <<<'MD'
                    # PHP Best Practices

                    - Always declare `strict_types=1` at the top of every file
                    - Follow PSR-12 coding standard
                    - Use type hints for all parameters, return types, and properties
                    - Use `readonly` properties and classes where applicable (PHP 8.2+)
                    - Prefer enums over class constants for fixed value sets (PHP 8.1+)
                    - Use named arguments for better readability on complex function calls
                    - Avoid magic methods unless absolutely necessary
                    - Use null-safe operator (`?->`) instead of null checks
                    - Prefer `match` expression over `switch` for value mapping
                    - Use first-class callable syntax (`strlen(...)`) for higher-order functions
                    MD,
                ),
            ],
            skills: [],
        );

        $this->register(
            stack: new TechStack(
                id: 'python',
                name: 'Python',
                category: 'language',
                implies: [],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Python Best Practices',
                    category: 'language/python',
                    paths: ['**/*.py'],
                    content: <<<'MD'
                    # Python Best Practices

                    - Use type hints for all function signatures (`def foo(x: int) -> str:`)
                    - Follow PEP 8 style guide; use `ruff` or `black` for formatting
                    - Use dataclasses or Pydantic models for structured data
                    - Prefer `pathlib.Path` over `os.path` for file operations
                    - Use context managers (`with`) for resource management
                    - Prefer list/dict comprehensions over `map`/`filter` for readability
                    - Use `logging` module instead of `print()` for application output
                    - Write docstrings for all public functions and classes (Google or NumPy style)
                    - Use virtual environments (`venv` or `poetry`) for dependency isolation
                    - Prefer `async/await` with `asyncio` for concurrent I/O operations
                    MD,
                ),
            ],
            skills: [],
        );

        $this->register(
            stack: new TechStack(
                id: 'go',
                name: 'Go',
                category: 'language',
                implies: [],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Go Best Practices',
                    category: 'language/go',
                    paths: ['**/*.go'],
                    content: <<<'MD'
                    # Go Best Practices

                    - Follow effective Go idioms; run `gofmt` and `go vet` on all code
                    - Handle errors explicitly; never use `_` to ignore errors
                    - Use interfaces for abstraction; keep them small (1-3 methods)
                    - Prefer returning errors over panicking
                    - Use `context.Context` for cancellation and request-scoped values
                    - Structure projects with `cmd/`, `internal/`, `pkg/` layout
                    - Use table-driven tests with `testing` package
                    - Avoid global state; use dependency injection
                    - Use goroutines with `sync.WaitGroup` or channels for concurrency
                    - Prefer `errors.Is()` and `errors.As()` for error checking (Go 1.13+)
                    MD,
                ),
            ],
            skills: [],
        );

        $this->register(
            stack: new TechStack(
                id: 'rust',
                name: 'Rust',
                category: 'language',
                implies: [],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Rust Best Practices',
                    category: 'language/rust',
                    paths: ['**/*.rs'],
                    content: <<<'MD'
                    # Rust Best Practices

                    - Use `clippy` for linting and `rustfmt` for formatting
                    - Prefer `Result<T, E>` over `unwrap()`/`expect()` in library code
                    - Use the `?` operator for error propagation
                    - Prefer `&str` over `String` in function parameters
                    - Use `derive` macros for common trait implementations
                    - Prefer iterators and combinators over manual loops
                    - Use `thiserror` for library errors and `anyhow` for application errors
                    - Minimize `unsafe` blocks; document invariants when required
                    - Use `Arc<Mutex<T>>` for shared mutable state across threads
                    - Write doc comments (`///`) for all public items
                    MD,
                ),
            ],
            skills: [],
        );

        $this->register(
            stack: new TechStack(
                id: 'java',
                name: 'Java',
                category: 'language',
                implies: [],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Java Best Practices',
                    category: 'language/java',
                    paths: ['**/*.java'],
                    content: <<<'MD'
                    # Java Best Practices

                    - Use Java records for immutable data transfer objects
                    - Prefer `var` for local variable type inference where type is obvious
                    - Use `Optional<T>` for nullable return values; avoid returning null
                    - Prefer `Stream` API for collection transformations
                    - Use sealed classes/interfaces for restricted type hierarchies
                    - Apply pattern matching with `instanceof` (Java 16+)
                    - Use `switch` expressions with pattern matching (Java 21+)
                    - Follow SOLID principles; prefer composition over inheritance
                    - Use SLF4J with Logback for logging
                    - Write unit tests with JUnit 5 and Mockito
                    MD,
                ),
            ],
            skills: [],
        );
    }

    private function registerInfraStacks(): void
    {
        $this->register(
            stack: new TechStack(
                id: 'docker',
                name: 'Docker',
                category: 'infra',
                implies: [],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Docker Best Practices',
                    category: 'infra/docker',
                    paths: ['Dockerfile*', 'docker-compose*', '.dockerignore'],
                    content: <<<'MD'
                    # Docker Best Practices

                    - Use multi-stage builds to minimize final image size
                    - Run containers as non-root user (`USER nobody` or custom user)
                    - Add `HEALTHCHECK` instructions for container health monitoring
                    - Use `.dockerignore` to exclude unnecessary files from build context
                    - Pin base image versions (e.g., `node:20-alpine`, not `node:latest`)
                    - Order Dockerfile instructions from least to most frequently changed (cache optimization)
                    - Use `COPY` over `ADD` unless extracting archives
                    - Combine `RUN` commands with `&&` to reduce layers
                    - Set explicit `WORKDIR` instead of using `cd` in RUN
                    - Use environment variables for runtime configuration, not build-time secrets
                    MD,
                ),
            ],
            skills: [
                new SkillTemplate(
                    name: 'dockerfile',
                    description: 'Generate an optimized Dockerfile with multi-stage builds',
                    userInvocable: true,
                    instructions: 'Create an optimized Dockerfile using multi-stage builds. Include a non-root user, HEALTHCHECK, proper .dockerignore, and pinned base image versions. Follow security best practices.',
                ),
            ],
        );

        $this->register(
            stack: new TechStack(
                id: 'github-actions',
                name: 'GitHub Actions',
                category: 'infra',
                implies: [],
            ),
            rules: [
                new RuleTemplate(
                    label: 'GitHub Actions Best Practices',
                    category: 'infra/github-actions',
                    paths: ['.github/workflows/**/*.yml', '.github/workflows/**/*.yaml'],
                    content: <<<'MD'
                    # GitHub Actions Best Practices

                    - Pin action versions to full SHA, not tags (`uses: actions/checkout@abc123`)
                    - Use reusable workflows for shared CI/CD logic
                    - Cache dependencies (`actions/cache`) to speed up builds
                    - Use matrix strategy for multi-version testing
                    - Set `timeout-minutes` on all jobs to prevent runaway workflows
                    - Use `concurrency` groups to cancel redundant runs
                    - Store secrets in GitHub Secrets; never hardcode credentials
                    - Use `GITHUB_TOKEN` permissions with least privilege (`permissions:` key)
                    - Separate CI (test) and CD (deploy) into distinct workflows
                    - Use `if: failure()` for notification steps on failure
                    MD,
                ),
            ],
            skills: [
                new SkillTemplate(
                    name: 'github-workflow',
                    description: 'Generate a GitHub Actions workflow for CI/CD',
                    userInvocable: true,
                    instructions: 'Create a GitHub Actions workflow YAML. Pin action versions, set timeout-minutes, use caching, and follow least-privilege permissions. Include lint, test, and build steps.',
                ),
            ],
        );

        $this->register(
            stack: new TechStack(
                id: 'kubernetes',
                name: 'Kubernetes',
                category: 'infra',
                implies: ['docker'],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Kubernetes Best Practices',
                    category: 'infra/kubernetes',
                    paths: ['k8s/**/*.yaml', 'k8s/**/*.yml', '**/*deployment*.yaml', '**/*service*.yaml'],
                    content: <<<'MD'
                    # Kubernetes Best Practices

                    - Always set resource requests and limits for CPU and memory
                    - Use liveness and readiness probes for health checking
                    - Use namespaces to isolate environments and teams
                    - Apply labels and annotations consistently for organization
                    - Use `Deployment` for stateless apps; `StatefulSet` for stateful workloads
                    - Store configuration in `ConfigMap`; secrets in `Secret` (encrypted at rest)
                    - Use `HorizontalPodAutoscaler` for scaling based on metrics
                    - Define `PodDisruptionBudget` for high-availability workloads
                    - Use `NetworkPolicy` to restrict pod-to-pod communication
                    - Prefer Helm or Kustomize for managing manifests across environments
                    MD,
                ),
            ],
            skills: [],
        );

        $this->register(
            stack: new TechStack(
                id: 'terraform',
                name: 'Terraform',
                category: 'infra',
                implies: [],
            ),
            rules: [
                new RuleTemplate(
                    label: 'Terraform Best Practices',
                    category: 'infra/terraform',
                    paths: ['**/*.tf', '**/*.tfvars'],
                    content: <<<'MD'
                    # Terraform Best Practices

                    - Use modules for reusable infrastructure components
                    - Store state remotely (S3 + DynamoDB, Terraform Cloud, etc.)
                    - Use `terraform fmt` and `terraform validate` in CI
                    - Define variables with types, descriptions, and validation rules
                    - Use `locals` for computed values to avoid repetition
                    - Tag all resources with environment, team, and project labels
                    - Use `data` sources to reference existing infrastructure
                    - Pin provider versions in `required_providers` block
                    - Use workspaces or directory-based separation for environments
                    - Review `terraform plan` output before applying changes
                    MD,
                ),
            ],
            skills: [],
        );
    }
}
