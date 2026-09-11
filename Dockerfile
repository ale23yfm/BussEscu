FROM php:8.4-fpm-alpine

# 1. Added git, unzip, zip, and linux-headers needed by Composer & PECL
RUN apk add --no-cache \
    ca-certificates \
    gettext \
    nginx \
    supervisor \
    autoconf \
    g++ \
    make \
    openssl-dev \
    linux-headers \
    git \
    unzip \
    zip \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

# 2. Added --ignore-platform-reqs to prevent PHP 8.4 version lock conflicts
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

COPY nginx/default.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisord.conf
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 10000
CMD ["/entrypoint.sh"]