# ==========================================
# Stage 1: composer dependencies
# ==========================================
FROM composer:2.8 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader \
    --ignore-platform-reqs

# ==========================================
# Stage 2: runtime
# ==========================================
FROM php:8.4-fpm-alpine AS runtime

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
        libpq-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        zip \
        opcache \
    && rm -rf /var/cache/apk/*

# OPcache configuration for development
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.revalidate_freq=0" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.validate_timestamps=1" >> /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

# Copy vendor from build stage
COPY --from=vendor /app/vendor ./vendor

# Copy application source
COPY . .

# Set ownership to www-data (non-root)
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

USER www-data

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD php-fpm -t || exit 1
