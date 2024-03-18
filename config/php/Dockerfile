FROM php:8.1-apache

RUN apt-get update && apt-get install -y \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
        zlib1g-dev \
        libxml2-dev \
        libzip-dev \
        libonig-dev \
        graphviz \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_mysql mysqli mbstring exif pcntl bcmath zip

RUN a2enmod rewrite ssl

COPY ./config/apache/myapp.conf /etc/apache2/sites-available/myapp.conf
COPY ./config/apache/myapp-ssl.conf /etc/apache2/sites-available/myapp-ssl.conf

RUN a2ensite myapp.conf myapp-ssl.conf

RUN a2dissite 000-default.conf

COPY ./config/apache/ssl/localhost.crt /etc/ssl/certs/localhost.crt
COPY ./config/apache/ssl/localhost.key /etc/ssl/private/localhost.key

COPY ./core/src /var/www/html/

RUN chown -R www-data:www-data /var/www/html/

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader

CMD ["apache2-foreground"]
