# ==============================================================================
# claude-forge — Docker Compose 개발 워크플로우
# ==============================================================================

DOCKER_COMPOSE     := docker compose
BACKEND_CONTAINER  := claude-forge-backend-1
FRONTEND_CONTAINER := claude-forge-frontend-1
DB_CONTAINER       := claude-forge-db-1
NGINX_CONTAINER    := claude-forge-nginx-1

DB_USER := forge
DB_NAME := claude_forge

.DEFAULT_GOAL := help

# ==============================================================================
# 기본 Docker 명령
# ==============================================================================

.PHONY: up
up: ## 전체 서비스 기동 (백그라운드)
	$(DOCKER_COMPOSE) up -d

.PHONY: down
down: ## 전체 서비스 중지
	$(DOCKER_COMPOSE) down

.PHONY: build
build: ## 이미지 빌드
	$(DOCKER_COMPOSE) build

.PHONY: rebuild
rebuild: ## 캐시 없이 재빌드 후 기동
	$(DOCKER_COMPOSE) build --no-cache
	$(DOCKER_COMPOSE) up -d

.PHONY: restart
restart: ## 전체 서비스 재시작
	$(DOCKER_COMPOSE) restart

.PHONY: logs
logs: ## 전체 서비스 로그 (follow)
	$(DOCKER_COMPOSE) logs -f

.PHONY: ps
ps: ## 서비스 상태 확인
	$(DOCKER_COMPOSE) ps

# ==============================================================================
# 개별 서비스 로그
# ==============================================================================

.PHONY: logs-frontend
logs-frontend: ## 프론트엔드 로그 (follow)
	$(DOCKER_COMPOSE) logs -f frontend

.PHONY: logs-backend
logs-backend: ## 백엔드 로그 (follow)
	$(DOCKER_COMPOSE) logs -f backend

.PHONY: logs-db
logs-db: ## DB 로그 (follow)
	$(DOCKER_COMPOSE) logs -f db

.PHONY: logs-nginx
logs-nginx: ## Nginx 로그 (follow)
	$(DOCKER_COMPOSE) logs -f nginx

# ==============================================================================
# 백엔드 (Laravel)
# ==============================================================================

.PHONY: backend-shell
backend-shell: ## 백엔드 컨테이너 bash 접속
	docker exec -it $(BACKEND_CONTAINER) bash

.PHONY: artisan
artisan: ## artisan 명령 실행 (예: make artisan cmd="migrate")
	docker exec -it $(BACKEND_CONTAINER) php artisan $(cmd)

.PHONY: composer
composer: ## composer 명령 실행 (예: make composer cmd="require laravel/sanctum")
	docker exec -it $(BACKEND_CONTAINER) composer $(cmd)

.PHONY: migrate
migrate: ## 마이그레이션 실행
	docker exec -it $(BACKEND_CONTAINER) php artisan migrate

.PHONY: seed
seed: ## 시더 실행
	docker exec -it $(BACKEND_CONTAINER) php artisan db:seed

.PHONY: tinker
tinker: ## tinker 접속
	docker exec -it $(BACKEND_CONTAINER) php artisan tinker

# ==============================================================================
# 프론트엔드
# ==============================================================================

.PHONY: frontend-shell
frontend-shell: ## 프론트엔드 컨테이너 sh 접속
	docker exec -it $(FRONTEND_CONTAINER) sh

.PHONY: npm
npm: ## npm 명령 실행 (예: make npm cmd="install axios")
	docker exec -it $(FRONTEND_CONTAINER) npm $(cmd)

# ==============================================================================
# DB (PostgreSQL)
# ==============================================================================

.PHONY: db-shell
db-shell: ## psql 접속
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME)

.PHONY: db-reset
db-reset: ## DB 리셋 (drop + create + migrate)
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -c "DROP DATABASE IF EXISTS $(DB_NAME);"
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -c "CREATE DATABASE $(DB_NAME);"
	docker exec -it $(BACKEND_CONTAINER) php artisan migrate

# ==============================================================================
# 유틸리티
# ==============================================================================

.PHONY: clean
clean: ## 볼륨 포함 전체 정리
	$(DOCKER_COMPOSE) down -v --remove-orphans

.PHONY: init
init: ## 최초 설정 (.env 복사 + 빌드 + 기동 + 마이그레이션)
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "backend/.env 생성 완료"; \
	fi
	@if [ ! -f frontend/.env ]; then \
		cp frontend/.env.example frontend/.env; \
		echo "frontend/.env 생성 완료"; \
	fi
	$(DOCKER_COMPOSE) build
	$(DOCKER_COMPOSE) up -d
	@echo "DB가 준비될 때까지 대기 중..."
	@until docker exec $(DB_CONTAINER) pg_isready -U $(DB_USER) -d $(DB_NAME) > /dev/null 2>&1; do \
		sleep 2; \
	done
	docker exec $(BACKEND_CONTAINER) php artisan key:generate
	docker exec $(BACKEND_CONTAINER) php artisan migrate
	@echo ""
	@echo "초기 설정 완료. http://localhost:8000 에서 확인하세요."

# ==============================================================================
# Help
# ==============================================================================

.PHONY: help
help: ## 사용 가능한 명령 목록
	@echo ""
	@echo "claude-forge 개발 명령어"
	@echo "========================"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "변수 오버라이드 예시:"
	@echo "  make artisan  cmd=\"route:list\""
	@echo "  make composer cmd=\"require spatie/laravel-permission\""
	@echo "  make npm      cmd=\"run build\""
	@echo ""
