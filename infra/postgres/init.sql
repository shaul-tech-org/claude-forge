-- ==========================================
-- claude-forge PostgreSQL 초기화 스크립트
-- ==========================================

-- UUID 생성 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 전문 검색 확장
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- claude_forge 데이터베이스는 POSTGRES_DB 환경변수로 이미 생성됨
-- 여기서는 확장 및 초기 설정만 수행

-- 기본 타임존 설정
SET timezone = 'UTC';
