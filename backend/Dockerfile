FROM php:8.4-fpm-alpine

RUN apk add --no-cache autoconf g++ make openssl-dev \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html