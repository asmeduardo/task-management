FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    bash \
    curl \
    git \
    unzip \
    postgresql-client \
    postgresql-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    autoconf \
    g++ \
    make \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        zip \
        intl \
        mbstring \
    && apk del autoconf g++ make postgresql-dev \
    && rm -rf /var/cache/apk/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN curl -sS https://get.symfony.com/cli/installer | bash \
    && mv /root/.symfony*/bin/symfony /usr/local/bin/symfony \
    && chmod +x /usr/local/bin/symfony

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /var/www/html

COPY composer.json composer.lock ./

RUN composer install --no-scripts --no-autoloader --no-dev --prefer-dist

COPY . .

RUN mkdir -p var/cache var/log \
    && chown -R www-data:www-data var/cache var/log \
    && chmod -R 777 var/cache var/log # Permissões de gravação para cache/log (dev)

RUN composer dump-autoload --optimize --no-dev

USER www-data

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint.sh"]