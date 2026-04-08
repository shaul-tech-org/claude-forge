<?php

declare(strict_types=1);

namespace App\Services\Recommendation;

use App\DTOs\Recommendation\RuleTemplate;

/**
 * Comprehensive rules database sourced from official documentation best practices.
 *
 * Each rule is a detailed markdown document with DO/DON'T patterns,
 * organized by stack ID. Rules are significantly more detailed than the
 * basic templates in TechStackRegistry.
 */
final class RulesDatabase
{
    /** @var array<string, RuleTemplate[]> */
    private static ?array $cache = null;

    /**
     * Get all rules across all stacks.
     *
     * @return array<string, RuleTemplate[]>
     */
    public static function all(): array
    {
        return self::$cache ??= self::buildAll();
    }

    /**
     * Get detailed rules for a specific stack.
     *
     * @return RuleTemplate[]
     */
    public static function forStack(string $stackId): array
    {
        return self::all()[$stackId] ?? [];
    }

    /**
     * Get all available stack IDs that have detailed rules.
     *
     * @return string[]
     */
    public static function availableStacks(): array
    {
        return array_keys(self::all());
    }

    /**
     * Get a flat list of all rules with their stack association.
     *
     * @return array<int, array{stackId: string, rule: RuleTemplate}>
     */
    public static function flatList(): array
    {
        $result = [];

        foreach (self::all() as $stackId => $rules) {
            foreach ($rules as $rule) {
                $result[] = [
                    'stackId' => $stackId,
                    'rule' => $rule,
                ];
            }
        }

        return $result;
    }

    /**
     * @return array<string, RuleTemplate[]>
     */
    private static function buildAll(): array
    {
        return [
            'react' => self::reactRules(),
            'typescript' => self::typescriptRules(),
            'laravel' => self::laravelRules(),
            'php' => self::phpRules(),
            'docker' => self::dockerRules(),
            'tailwind' => self::tailwindRules(),
            'nextjs' => self::nextjsRules(),
            'github-actions' => self::githubActionsRules(),
        ];
    }

    /**
     * @return RuleTemplate[]
     */
    private static function reactRules(): array
    {
        return [
            new RuleTemplate(
                label: 'React Component Patterns',
                category: 'frontend/react',
                paths: ['**/*.tsx', '**/*.jsx'],
                content: <<<'MD'
                ## React Component Patterns

                ### Functional Components Only
                Always use functional components. Class components are legacy and should never
                be used in new code. Every component must have a typed props interface.

                ### DO: Typed Functional Component
                ```tsx
                interface UserCardProps {
                  readonly user: User;
                  readonly onSelect?: (id: string) => void;
                }

                export const UserCard = memo(function UserCard({ user, onSelect }: UserCardProps) {
                  const handleClick = useCallback(() => {
                    onSelect?.(user.id);
                  }, [user.id, onSelect]);

                  return (
                    <article onClick={handleClick}>
                      <h3>{user.name}</h3>
                    </article>
                  );
                });
                ```

                ### DON'T: Untyped or Class Components
                ```tsx
                // NEVER: class component
                class UserCard extends React.Component { ... }

                // NEVER: untyped props
                export const UserCard = (props: any) => { ... };

                // NEVER: inline object props causing re-renders
                <UserCard style={{ color: 'red' }} />
                ```

                ### React.memo Strategy
                - Wrap components that receive complex props or render in lists
                - Use named function expressions inside `memo()` for better DevTools display
                - Combine with `useCallback` for stable handler references

                ### Composition Over Configuration
                - Prefer children and render props over deeply nested config objects
                - Use compound components (e.g., `<Tabs>`, `<Tabs.Panel>`) for related UI groups
                - Keep components under 150 lines; extract sub-components when complexity grows
                - Colocate closely related components in the same file if they are small
                MD,
            ),
            new RuleTemplate(
                label: 'React Hooks Best Practices',
                category: 'frontend/react',
                paths: ['**/*.tsx', '**/*.jsx', '**/use*.ts'],
                content: <<<'MD'
                ## React Hooks Best Practices

                ### Custom Hooks
                Extract reusable stateful logic into custom hooks prefixed with `use`.
                Each custom hook should have a single clear responsibility.

                ### DO: Well-structured Custom Hook
                ```tsx
                function useDebounce<T>(value: T, delayMs: number): T {
                  const [debounced, setDebounced] = useState(value);

                  useEffect(() => {
                    const timer = setTimeout(() => setDebounced(value), delayMs);
                    return () => clearTimeout(timer);
                  }, [value, delayMs]);

                  return debounced;
                }
                ```

                ### DON'T: Missing Cleanup or Wrong Dependencies
                ```tsx
                // NEVER: missing cleanup — causes memory leaks
                useEffect(() => {
                  const ws = new WebSocket(url);
                  ws.onmessage = handler;
                  // missing: return () => ws.close();
                }, [url]);

                // NEVER: object literal in dependency array (always new reference)
                useEffect(() => { ... }, [{ id: userId }]);

                // NEVER: missing dependencies
                useEffect(() => {
                  fetchData(userId);
                }, []); // userId is missing
                ```

                ### Dependency Array Rules
                - Include every reactive value used inside the effect
                - Use `useCallback` and `useMemo` to stabilize references before passing them as deps
                - Never suppress the `react-hooks/exhaustive-deps` ESLint rule
                - If an effect should run once, ensure the values it uses truly never change

                ### useEffect Cleanup
                - Always return a cleanup function for subscriptions, timers, and event listeners
                - Abort fetch requests with `AbortController` on unmount
                - Clear intervals/timeouts to prevent state updates on unmounted components

                ### Hook Call Order
                - Hooks must be called at the top level — never inside conditions, loops, or nested functions
                - Keep hook calls in a consistent order: state, refs, memos, callbacks, effects
                MD,
            ),
            new RuleTemplate(
                label: 'React State Management',
                category: 'frontend/react',
                paths: ['**/*.tsx', '**/*.jsx', '**/store/**', '**/context/**'],
                content: <<<'MD'
                ## React State Management

                ### State Colocation Principle
                Keep state as close to where it is consumed as possible. Lift state up only
                when multiple siblings need the same data.

                ### DO: Choosing the Right State Tool
                ```tsx
                // Simple local state → useState
                const [count, setCount] = useState(0);

                // Complex local state with actions → useReducer
                const [state, dispatch] = useReducer(formReducer, initialFormState);

                // Shared UI state across subtree → Context + useReducer
                const ThemeContext = createContext<ThemeContextValue | null>(null);

                // Server/async state → TanStack Query (react-query)
                const { data, isLoading } = useQuery({
                  queryKey: ['users', filters],
                  queryFn: () => fetchUsers(filters),
                });
                ```

                ### DON'T: Common State Mistakes
                ```tsx
                // NEVER: store derived data in state
                const [items, setItems] = useState<Item[]>([]);
                const [filteredItems, setFilteredItems] = useState<Item[]>([]); // derive instead
                // DO: const filteredItems = useMemo(() => items.filter(...), [items]);

                // NEVER: use Context for high-frequency updates (causes full subtree re-render)
                // Use a state management library (Zustand, Jotai) for frequently changing global state

                // NEVER: prop drill through 4+ levels — introduce context or composition
                ```

                ### useReducer for Complex State
                - Use when state transitions depend on previous state
                - Define actions as discriminated unions for type safety
                - Keep the reducer pure — no side effects inside it

                ### Server State vs. Client State
                - Server state (fetched data): use TanStack Query or SWR with cache invalidation
                - Client state (UI toggles, form input): use useState / useReducer
                - URL state (filters, pagination): use URL search params as the source of truth
                - Never duplicate server data into local state; read from cache
                MD,
            ),
        ];
    }

    /**
     * @return RuleTemplate[]
     */
    private static function typescriptRules(): array
    {
        return [
            new RuleTemplate(
                label: 'TypeScript Strict Mode Rules',
                category: 'language/typescript',
                paths: ['**/*.ts', '**/*.tsx'],
                content: <<<'MD'
                ## TypeScript Strict Mode Rules

                ### Mandatory Configuration
                Always enable `strict: true` in `tsconfig.json`. This enables `strictNullChecks`,
                `noImplicitAny`, `strictFunctionTypes`, and all other strict flags.

                ### DO: Strict Type Patterns
                ```typescript
                // Type narrowing with discriminated unions
                type Result<T> =
                  | { success: true; data: T }
                  | { success: false; error: Error };

                function handle<T>(result: Result<T>): T {
                  if (result.success) {
                    return result.data; // narrowed to { success: true; data: T }
                  }
                  throw result.error; // narrowed to { success: false; error: Error }
                }

                // Generics with constraints
                function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
                  return obj[key];
                }

                // Utility types for transformation
                type CreateUserDTO = Omit<User, 'id' | 'createdAt'>;
                type PartialUpdate = Partial<Pick<User, 'name' | 'email'>>;
                ```

                ### DON'T: Type Safety Violations
                ```typescript
                // NEVER: use `any` — use `unknown` and narrow
                function parse(input: any) { ... }        // bad
                function parse(input: unknown) { ... }    // good

                // NEVER: type assertion to bypass checks
                const user = data as User;                // bad — bypasses validation
                if (isUser(data)) { const user = data; }  // good — runtime check

                // NEVER: non-null assertion without guarantee
                const name = user!.name;                  // bad
                const name = user?.name ?? 'Anonymous';   // good
                ```

                ### Type Narrowing Techniques
                - `typeof` for primitives (`typeof x === 'string'`)
                - `in` operator for object shapes (`'name' in obj`)
                - Custom type guards (`function isUser(x: unknown): x is User`)
                - Discriminated unions with a literal `type` or `kind` field
                - `satisfies` operator for type-safe object literals while preserving inference

                ### Generics Guidelines
                - Use meaningful names (`TItem`, `TResponse`, not `T`, `U` for complex signatures)
                - Add constraints with `extends` to limit generic scope
                - Avoid more than 3 type parameters — refactor the design if needed
                MD,
            ),
            new RuleTemplate(
                label: 'TypeScript Async Patterns',
                category: 'language/typescript',
                paths: ['**/*.ts', '**/*.tsx'],
                content: <<<'MD'
                ## TypeScript Async Patterns

                ### Always Use async/await
                Prefer `async/await` over `.then()` chains for readability and stack traces.
                Every async function must have proper error handling.

                ### DO: Proper Async Patterns
                ```typescript
                // Typed async function with error handling
                async function fetchUser(id: string): Promise<User> {
                  const response = await fetch(`/api/users/${id}`);

                  if (!response.ok) {
                    throw new ApiError(`Failed to fetch user: ${response.status}`);
                  }

                  return response.json() as Promise<User>;
                }

                // Parallel execution with Promise.all
                async function loadDashboard(userId: string): Promise<Dashboard> {
                  const [user, posts, notifications] = await Promise.all([
                    fetchUser(userId),
                    fetchPosts(userId),
                    fetchNotifications(userId),
                  ]);

                  return { user, posts, notifications };
                }

                // Promise.allSettled for partial failure tolerance
                const results = await Promise.allSettled(urls.map(fetch));
                const successful = results
                  .filter((r): r is PromiseFulfilledResult<Response> => r.status === 'fulfilled')
                  .map(r => r.value);
                ```

                ### DON'T: Async Anti-patterns
                ```typescript
                // NEVER: fire-and-forget without error handling
                async function save() {
                  updateDatabase(data); // missing await — errors are silently lost
                }

                // NEVER: sequential when parallel is possible
                const user = await fetchUser(id);
                const posts = await fetchPosts(id); // no dependency on user — parallelize!

                // NEVER: catch and swallow errors
                try { await riskyOperation(); } catch { } // error lost

                // NEVER: return await in a try block (redundant)
                async function foo() { return await bar(); } // just return bar()
                ```

                ### Error Handling Strategy
                - Define custom error classes extending `Error` for domain-specific failures
                - Use `try/catch` at boundary layers (API handlers, event listeners)
                - Let errors propagate through intermediate layers — do not catch-and-rethrow without adding context
                - Always type the error in catch blocks: `catch (error: unknown)`

                ### Cancellation Pattern
                - Use `AbortController` for cancellable fetch requests
                - Pass `AbortSignal` through async chains for cooperative cancellation
                - Check `signal.aborted` before expensive operations in long-running tasks
                MD,
            ),
        ];
    }

    /**
     * @return RuleTemplate[]
     */
    private static function laravelRules(): array
    {
        return [
            new RuleTemplate(
                label: 'Laravel Architecture Patterns',
                category: 'backend/laravel',
                paths: ['**/*.php'],
                content: <<<'MD'
                ## Laravel Architecture Patterns

                ### Service Pattern — Thin Controllers
                Controllers handle HTTP concerns only: receive the request, call a service, return a response.
                All business logic lives in Service classes.

                ### DO: Layered Architecture
                ```php
                // Controller — thin, delegates to service
                final class UserController extends Controller
                {
                    public function __construct(
                        private readonly UserService $userService,
                    ) {}

                    public function store(StoreUserRequest $request): JsonResponse
                    {
                        $user = $this->userService->create($request->validated());
                        return response()->json(new UserResource($user), 201);
                    }
                }

                // Service — business logic + transactions
                final class UserService
                {
                    public function __construct(
                        private readonly UserRepository $repository,
                    ) {}

                    public function create(array $data): User
                    {
                        return DB::transaction(function () use ($data): User {
                            $user = $this->repository->create($data);
                            event(new UserCreated($user));
                            return $user;
                        });
                    }
                }
                ```

                ### DON'T: Fat Controllers
                ```php
                // NEVER: business logic in controller
                public function store(Request $request): JsonResponse
                {
                    $validated = $request->validate([...]); // use FormRequest instead
                    $user = User::create($validated);       // service should handle this
                    Mail::send(...);                         // side effects in controller
                    return response()->json($user);         // expose model directly
                }
                ```

                ### Layer Responsibilities
                - **Controller**: HTTP input/output, calls service, returns Resource
                - **FormRequest**: validation rules, authorization check
                - **Service**: business logic, orchestration, DB transactions
                - **Repository** (optional): complex query encapsulation
                - **Resource**: response transformation, consistent JSON structure
                - **Event/Listener**: side effects (email, notifications, audit logs)

                ### Configuration Access
                - Always use `config('key')` helper — never `env()` outside config files
                - Define all environment-dependent values in `config/*.php` files
                - This ensures `config:cache` works correctly in production
                MD,
            ),
            new RuleTemplate(
                label: 'Laravel Eloquent Best Practices',
                category: 'backend/laravel',
                paths: ['**/*.php'],
                content: <<<'MD'
                ## Laravel Eloquent Best Practices

                ### Eager Loading — Prevent N+1
                Always eager-load relationships when you know they will be accessed.
                Enable `Model::preventLazyLoading()` in `AppServiceProvider` during development.

                ### DO: Efficient Queries
                ```php
                // Eager load relationships
                $posts = Post::with(['author', 'tags', 'comments.user'])
                    ->where('published', true)
                    ->latest()
                    ->paginate(20);

                // Query scopes for reusable conditions
                class Post extends Model
                {
                    public function scopePublished(Builder $query): Builder
                    {
                        return $query->where('published_at', '<=', now());
                    }

                    public function scopeByAuthor(Builder $query, int $authorId): Builder
                    {
                        return $query->where('author_id', $authorId);
                    }
                }

                // Usage: Post::published()->byAuthor($id)->get();
                ```

                ### DON'T: Eloquent Anti-patterns
                ```php
                // NEVER: lazy loading in loops (N+1)
                $posts = Post::all();
                foreach ($posts as $post) {
                    echo $post->author->name; // N+1 queries!
                }

                // NEVER: select * when you need specific columns
                $names = User::all(); // loads every column
                $names = User::select(['id', 'name'])->get(); // good

                // NEVER: use Model::unguard() — define $fillable instead
                ```

                ### Accessors and Casts
                - Use `Attribute` for computed values: `protected function fullName(): Attribute`
                - Use `$casts` array for type coercion (dates, enums, JSON, encrypted)
                - Prefer Enum casts for status fields: `'status' => OrderStatus::class`

                ### Mass Assignment Protection
                - Define `$fillable` on every model — explicitly whitelist assignable fields
                - Use `$request->validated()` from FormRequest for mass assignment
                - Never pass raw `$request->all()` to `create()` or `update()`

                ### Performance Tips
                - Use `chunk()` or `lazy()` for processing large datasets
                - Use `exists()` instead of `count() > 0` for existence checks
                - Use `withCount()` for relationship counts without loading full relations
                - Add database indexes for columns used in `where`, `orderBy`, `groupBy`
                MD,
            ),
            new RuleTemplate(
                label: 'Laravel Testing with Pest',
                category: 'backend/laravel',
                paths: ['tests/**/*.php'],
                content: <<<'MD'
                ## Laravel Testing with Pest

                ### Test Structure
                Use Pest syntax for concise, readable tests. Organize by Feature (HTTP) and
                Unit (isolated logic) tests.

                ### DO: Feature Test Pattern
                ```php
                // tests/Feature/Api/UserControllerTest.php
                use App\Models\User;

                describe('POST /api/v1/users', function () {
                    it('creates a user with valid data', function () {
                        $payload = [
                            'name' => 'Jane Doe',
                            'email' => 'jane@example.com',
                        ];

                        $response = $this->postJson('/api/v1/users', $payload);

                        $response
                            ->assertStatus(201)
                            ->assertJsonPath('data.name', 'Jane Doe');

                        $this->assertDatabaseHas('users', ['email' => 'jane@example.com']);
                    });

                    it('rejects invalid email', function () {
                        $this->postJson('/api/v1/users', ['name' => 'X', 'email' => 'bad'])
                            ->assertStatus(422)
                            ->assertJsonValidationErrors(['email']);
                    });
                });
                ```

                ### DON'T: Testing Anti-patterns
                ```php
                // NEVER: test implementation details — test behavior
                it('calls repository save method', function () { ... }); // fragile

                // NEVER: depend on database row IDs
                expect($user->id)->toBe(1); // breaks with parallel tests

                // NEVER: skip cleanup — use RefreshDatabase or DatabaseTransactions trait
                ```

                ### Factories and Test Data
                - Use Model Factories for all test data: `User::factory()->create()`
                - Chain factory states for variations: `User::factory()->admin()->create()`
                - Use `sequence()` for bulk creation with varied data
                - Never hardcode IDs or rely on seeder data in tests

                ### Assertion Best Practices
                - `assertJsonStructure()` for response shape validation
                - `assertDatabaseHas()` / `assertDatabaseMissing()` for persistence checks
                - `assertStatus()` with exact HTTP codes (201, 422, 403)
                - Use Pest expectations: `expect($value)->toBe()`, `->toBeInstanceOf()`

                ### Test Isolation
                - Use `RefreshDatabase` trait for feature tests
                - Mock external services (HTTP, mail, queue) with `Http::fake()`, `Mail::fake()`
                - Use `$this->freezeTime()` for time-dependent tests
                - Each test must be independent — no shared mutable state between tests
                MD,
            ),
        ];
    }

    /**
     * @return RuleTemplate[]
     */
    private static function phpRules(): array
    {
        return [
            new RuleTemplate(
                label: 'Modern PHP 8.4 Patterns',
                category: 'language/php',
                paths: ['**/*.php'],
                content: <<<'MD'
                ## Modern PHP 8.4 Patterns

                ### Strict Types Everywhere
                Every PHP file must begin with `declare(strict_types=1)`. This prevents
                implicit type coercion and catches bugs at call time.

                ### DO: Modern PHP Features
                ```php
                declare(strict_types=1);

                // Readonly classes (immutable DTOs)
                readonly class CreateUserDTO
                {
                    public function __construct(
                        public string $name,
                        public string $email,
                        public ?string $avatar = null,
                    ) {}
                }

                // Enums for fixed value sets
                enum OrderStatus: string
                {
                    case Pending = 'pending';
                    case Confirmed = 'confirmed';
                    case Shipped = 'shipped';
                    case Delivered = 'delivered';

                    public function label(): string
                    {
                        return match ($this) {
                            self::Pending => 'Order Pending',
                            self::Confirmed => 'Confirmed',
                            self::Shipped => 'In Transit',
                            self::Delivered => 'Delivered',
                        };
                    }
                }

                // Named arguments for clarity
                $user = new User(
                    name: $dto->name,
                    email: $dto->email,
                    role: Role::Member,
                );
                ```

                ### DON'T: Legacy PHP Patterns
                ```php
                // NEVER: missing strict_types
                <?php // must have declare(strict_types=1);

                // NEVER: class constants instead of enums
                class Status { const PENDING = 'pending'; }

                // NEVER: arrays for structured data — use readonly classes
                $user = ['name' => 'Jane', 'email' => 'j@x.com'];

                // NEVER: switch with break — use match expression
                switch ($status) {
                    case 'pending': $label = 'Pending'; break;
                }
                // DO: $label = match($status) { 'pending' => 'Pending' };
                ```

                ### Null Safety
                - Use the null-safe operator: `$user?->address?->city`
                - Use null coalescing: `$name = $input['name'] ?? 'default'`
                - Type nullable parameters explicitly: `?string $name` or `string|null $name`
                - Avoid returning null from methods — prefer throwing exceptions or using Option types

                ### Match Expression
                - Use `match` instead of `switch` for value mapping (strict comparison, no fall-through)
                - `match` is an expression — it returns a value, assign it directly
                - `match` throws `UnhandledMatchError` for unmatched values — always handle all cases

                ### First-class Callable Syntax
                - Use `strlen(...)` instead of `'strlen'` string references
                - Works with methods: `$this->process(...)`, `Validator::validate(...)`
                - Combine with `array_map`, `array_filter` for clean functional pipelines
                MD,
            ),
        ];
    }

    /**
     * @return RuleTemplate[]
     */
    private static function dockerRules(): array
    {
        return [
            new RuleTemplate(
                label: 'Production Docker Patterns',
                category: 'infra/docker',
                paths: ['Dockerfile*', 'docker-compose*', '.dockerignore'],
                content: <<<'MD'
                ## Production Docker Patterns

                ### Multi-stage Builds
                Use multi-stage builds to separate build dependencies from the runtime image.
                The final image should contain only what is needed to run the application.

                ### DO: Optimized Multi-stage Dockerfile
                ```dockerfile
                # Stage 1: Build
                FROM node:20-alpine AS builder
                WORKDIR /app
                COPY package.json package-lock.json ./
                RUN npm ci --ignore-scripts
                COPY . .
                RUN npm run build

                # Stage 2: Production
                FROM node:20-alpine AS runtime
                RUN addgroup -S app && adduser -S app -G app
                WORKDIR /app
                COPY --from=builder --chown=app:app /app/dist ./dist
                COPY --from=builder --chown=app:app /app/node_modules ./node_modules
                USER app
                EXPOSE 3000
                HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
                  CMD wget -qO- http://localhost:3000/health || exit 1
                CMD ["node", "dist/main.js"]
                ```

                ### DON'T: Insecure or Bloated Images
                ```dockerfile
                # NEVER: run as root
                # (missing USER directive)

                # NEVER: use latest tag
                FROM node:latest

                # NEVER: copy everything without .dockerignore
                COPY . .

                # NEVER: install dev dependencies in production
                RUN npm install

                # NEVER: store secrets in image layers
                ENV DATABASE_PASSWORD=secret123
                ```

                ### Security Hardening
                - Always run as a non-root user (`USER app`)
                - Pin base image versions with digest or exact tag (`node:20.12-alpine`)
                - Scan images for vulnerabilities (`docker scout`, `trivy`)
                - Never embed secrets — use runtime environment variables or secret managers
                - Set `--no-cache` or clean package manager cache in the same `RUN` layer

                ### Layer Optimization
                - Order instructions from least to most frequently changed
                - Copy `package.json`/`composer.json` first, install deps, then copy source
                - Combine related `RUN` commands with `&&` to minimize layers
                - Use `.dockerignore` to exclude `.git`, `node_modules`, `tests`, docs

                ### Docker Compose for Development
                - Use `compose.yaml` (v2 format) with named volumes for persistence
                - Define `healthcheck` for all services
                - Use `depends_on` with `condition: service_healthy` for startup order
                - Override production settings with `compose.override.yaml` for dev
                MD,
            ),
        ];
    }

    /**
     * @return RuleTemplate[]
     */
    private static function tailwindRules(): array
    {
        return [
            new RuleTemplate(
                label: 'Tailwind CSS Conventions',
                category: 'frontend/tailwind',
                paths: ['**/*.tsx', '**/*.jsx', '**/*.vue', '**/*.html'],
                content: <<<'MD'
                ## Tailwind CSS Conventions

                ### Utility-first Approach
                Build UI with utility classes directly in markup. Extract components for reuse,
                not CSS classes. Only use `@apply` for third-party library overrides.

                ### DO: Utility-first Patterns
                ```tsx
                // Component extraction over @apply
                function Badge({ children, variant = 'default' }: BadgeProps) {
                  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
                  const variants = {
                    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
                    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                  } as const;

                  return <span className={cn(base, variants[variant])}>{children}</span>;
                }

                // Responsive design with mobile-first breakpoints
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                ```

                ### DON'T: Tailwind Anti-patterns
                ```css
                /* NEVER: @apply for everything — defeats the purpose */
                .btn-primary {
                  @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600;
                }

                /* NEVER: arbitrary values when a token exists */
                <div className="mt-[17px]">  <!-- use mt-4 (16px) instead -->
                ```

                ### Class Organization
                - Group classes logically: layout, sizing, spacing, typography, colors, effects
                - Use `cn()` (from `clsx` + `tailwind-merge`) for conditional and conflicting classes
                - Split long class strings across multiple lines for readability
                - Keep a consistent ordering convention across the team

                ### Responsive Design
                - Mobile-first: base classes apply to all screens, add `sm:`, `md:`, `lg:` for larger
                - Common breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
                - Use container queries (`@container`) for component-level responsiveness

                ### Dark Mode
                - Use the `dark:` variant for all color utilities
                - Define semantic color tokens in `tailwind.config.ts` (e.g., `bg-surface`, `text-primary`)
                - Test both light and dark modes — never hard-code colors without a dark variant
                - Use `class` strategy (not `media`) for user-controlled dark mode toggle
                MD,
            ),
        ];
    }

    /**
     * @return RuleTemplate[]
     */
    private static function nextjsRules(): array
    {
        return [
            new RuleTemplate(
                label: 'Next.js App Router Patterns',
                category: 'frontend/nextjs',
                paths: ['**/*.tsx', '**/*.ts', 'app/**/*'],
                content: <<<'MD'
                ## Next.js App Router Patterns

                ### Server Components by Default
                All components in the App Router are Server Components unless explicitly marked
                with `'use client'`. Keep client components minimal and leaf-level.

                ### DO: Server and Client Component Split
                ```tsx
                // app/users/page.tsx — Server Component (default)
                import { UserList } from './user-list';

                export default async function UsersPage() {
                  const users = await db.user.findMany(); // direct DB access in server

                  return (
                    <main>
                      <h1>Users</h1>
                      <UserList users={users} />
                    </main>
                  );
                }

                // app/users/user-list.tsx — Client Component (interactive)
                'use client';

                import { useState } from 'react';

                export function UserList({ users }: { users: User[] }) {
                  const [search, setSearch] = useState('');
                  const filtered = users.filter(u => u.name.includes(search));

                  return (
                    <>
                      <input value={search} onChange={e => setSearch(e.target.value)} />
                      {filtered.map(u => <UserCard key={u.id} user={u} />)}
                    </>
                  );
                }
                ```

                ### DON'T: App Router Anti-patterns
                ```tsx
                // NEVER: 'use client' on a page that only displays data
                'use client'; // remove — this can be a Server Component

                // NEVER: useEffect for data fetching in Server Components
                useEffect(() => { fetch('/api/users')... }, []); // fetch directly in server

                // NEVER: pass non-serializable props from Server to Client Component
                <ClientComp handler={async () => {}} /> // functions are not serializable
                ```

                ### Data Fetching
                - Fetch data directly in Server Components with `async/await`
                - Use `fetch()` with Next.js caching: `{ next: { revalidate: 3600 } }`
                - For mutations, use Server Actions (`'use server'` functions)
                - Use `loading.tsx` for streaming Suspense fallbacks per route segment

                ### Caching Strategy
                - Static data: `force-cache` (default for `fetch` in server components)
                - Dynamic data: `no-store` or `revalidate: N` seconds
                - Use `revalidatePath()` or `revalidateTag()` for on-demand cache invalidation
                - Understand the four caching layers: Request Memoization, Data Cache, Full Route Cache, Router Cache

                ### File Conventions
                - `page.tsx` — route UI
                - `layout.tsx` — shared layout (persists across navigations)
                - `loading.tsx` — streaming loading state
                - `error.tsx` — error boundary (`'use client'` required)
                - `not-found.tsx` — 404 page
                - Use `generateMetadata()` or `metadata` export for SEO on every page
                MD,
            ),
        ];
    }

    /**
     * @return RuleTemplate[]
     */
    private static function githubActionsRules(): array
    {
        return [
            new RuleTemplate(
                label: 'GitHub Actions CI Patterns',
                category: 'infra/github-actions',
                paths: ['.github/workflows/**/*.yml', '.github/workflows/**/*.yaml'],
                content: <<<'MD'
                ## GitHub Actions CI Patterns

                ### Security First
                Pin action versions to full commit SHA, not mutable tags. Use least-privilege
                `permissions` on every workflow. Never hardcode secrets in workflow files.

                ### DO: Well-structured CI Workflow
                ```yaml
                name: CI
                on:
                  pull_request:
                    branches: [main]
                  push:
                    branches: [main]

                permissions:
                  contents: read

                concurrency:
                  group: ci-${{ github.ref }}
                  cancel-in-progress: true

                jobs:
                  lint-and-test:
                    runs-on: ubuntu-latest
                    timeout-minutes: 15
                    strategy:
                      matrix:
                        node-version: [20, 22]

                    steps:
                      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4
                      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8 # v4
                        with:
                          node-version: ${{ matrix.node-version }}
                          cache: npm
                      - run: npm ci
                      - run: npm run lint
                      - run: npm test -- --coverage
                      - uses: actions/upload-artifact@5d5d22a31266ced268874388b861e4b58bb5c2f3 # v4
                        if: always()
                        with:
                          name: coverage-${{ matrix.node-version }}
                          path: coverage/
                ```

                ### DON'T: CI Anti-patterns
                ```yaml
                # NEVER: mutable tag versions
                - uses: actions/checkout@v4  # can change under you

                # NEVER: missing timeout (jobs can run forever)
                jobs:
                  test:
                    runs-on: ubuntu-latest
                    # missing timeout-minutes!

                # NEVER: hardcoded secrets
                env:
                  API_KEY: sk-1234567890  # use ${{ secrets.API_KEY }}

                # NEVER: install deps without cache
                - run: npm install  # use npm ci + actions/cache or setup-node cache
                ```

                ### Caching Strategy
                - Use `actions/setup-node` / `actions/setup-python` built-in `cache` option
                - For custom caches, use `actions/cache` with a hash-based key
                - Cache key pattern: `${{ runner.os }}-deps-${{ hashFiles('**/lockfile') }}`
                - Restore keys for partial cache hits: `${{ runner.os }}-deps-`

                ### Matrix Builds
                - Use `strategy.matrix` for testing across versions, OSes, or configurations
                - Set `fail-fast: false` to see all failures, not just the first
                - Use `exclude` or `include` to customize specific matrix combinations

                ### Artifacts and Secrets
                - Upload test results, coverage reports, and build artifacts with `actions/upload-artifact`
                - Use `${{ secrets.NAME }}` for sensitive values — never echo or log them
                - Use `GITHUB_TOKEN` with explicit `permissions` block at workflow or job level
                - For deploy workflows, require environment protection rules and approval
                MD,
            ),
        ];
    }
}
