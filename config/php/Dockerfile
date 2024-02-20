FROM php:8.1-apache

# Install required packages and PHP extensions
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

# Enable Apache mod_rewrite and SSL module
RUN a2enmod rewrite ssl

# Copy Apache configuration files for HTTP and HTTPS
COPY ./config/apache/myapp.conf /etc/apache2/sites-available/myapp.conf
COPY ./config/apache/myapp-ssl.conf /etc/apache2/sites-available/myapp-ssl.conf

# Enable the site configurations
RUN a2ensite myapp.conf myapp-ssl.conf

# Disable the default site
RUN a2dissite 000-default.conf

# Copy SSL certificates
COPY ./config/apache/ssl/localhost.crt /etc/ssl/certs/localhost.crt
COPY ./config/apache/ssl/localhost.key /etc/ssl/private/localhost.key

# Set document root
COPY ./core/src /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html/

# Install Composer and PHP dependencies
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader

CMD ["apache2-foreground"]
