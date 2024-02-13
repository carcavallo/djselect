FROM composer:2.6.6 as build

WORKDIR /app

COPY /core/src/composer.json /app/

RUN composer install

FROM php:8.3-fpm-alpine

RUN docker-php-ext-install pdo_mysql

COPY --chown=www-data:1000 --from=build /app/vendor /usr/src/backend/vendor

RUN mkdir /usr/src/backend/logs

RUN mkdir /usr/src/backend/sessions

RUN chown -R www-data:1000 /usr/src

RUN find /usr/src -type d -exec chmod 775 {} \;

RUN find /usr/src -type f -exec chmod 664 {} \;

WORKDIR /usr/src/backend