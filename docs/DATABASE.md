# 데이터베이스 스키마

## 개요

- **DBMS**: PostgreSQL 18
- **접속**: `localhost:5433` (Docker 외부) / `db:5432` (Docker 내부)
- **사용자**: `forge` / **DB명**: `claude_forge`

현재 프로젝트는 **상태 비저장(stateless) API 중심**으로, 하네스 평가/추천은 메모리 내 서비스로 처리됩니다.
DB는 향후 프로젝트 저장, 사용자 인증, 히스토리 기능 확장에 활용됩니다.

## 테이블

### users

Laravel 기본 인증 테이블.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | bigint (PK) | |
| name | varchar | 사용자명 |
| email | varchar (unique) | 이메일 |
| email_verified_at | timestamp | 이메일 인증 일시 |
| password | varchar | 해시된 비밀번호 |
| remember_token | varchar(100) | 자동 로그인 토큰 |
| created_at | timestamp | |
| updated_at | timestamp | |

### password_reset_tokens

| 컬럼 | 타입 | 설명 |
|------|------|------|
| email | varchar (PK) | |
| token | varchar | 리셋 토큰 |
| created_at | timestamp | |

### sessions

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | varchar(255) (PK) | 세션 ID |
| user_id | bigint (FK → users) | |
| ip_address | varchar(45) | |
| user_agent | text | |
| payload | longtext | |
| last_activity | integer (index) | |

### cache / cache_locks

Laravel 캐시 드라이버 테이블.

### jobs / job_batches / failed_jobs

Laravel 큐 시스템 테이블.

## 마이그레이션

```bash
# 마이그레이션 실행
make migrate

# 상태 확인
make artisan cmd="migrate:status"

# 리셋
make db-reset
```

## 향후 확장 계획

| 테이블 | 용도 | Phase |
|--------|------|-------|
| projects | 하네스 프로젝트 저장 | 미정 |
| harness_evaluations | 평가 히스토리 | 미정 |
| patterns | 사용자 정의 패턴 | 미정 |
| shared_configs | 설정 공유 | 미정 |
