# ==============================================================================
# ArixByte Web Hosting - Production Pterodactyl Egg Dockerfile
# Base: Ubuntu 24.04 LTS (Noble Numbat)
# Stack: PHP 8.4, Nginx, Node.js LTS, Composer, Git
# ==============================================================================

FROM ubuntu:24.04

LABEL maintainer="support@arixbyte.com"
LABEL org.opencontainers.image.source="https://github.com/arixbyte/pterodactyl-web-hosting"
LABEL org.opencontainers.image.description="Production web hosting egg for Pterodactyl Panel supporting Static, PHP, Laravel, and Node.js applications."

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Install essential system dependencies, PPA prerequisites, and utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common \
    lsb-release \
    ca-certificates \
    apt-transport-https \
    gnupg2 \
    curl \
    wget \
    git \
    unzip \
    zip \
    supervisor \
    gettext-base \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Add Ondrej PHP PPA for PHP 8.4 support on Ubuntu
RUN LC_ALL=C.UTF-8 add-apt-repository -y ppa:ondrej/php \
    && apt-get update

# Install PHP 8.4 and required extensions for modern frameworks & WordPress
RUN apt-get install -y --no-install-recommends \
    php8.4-fpm \
    php8.4-cli \
    php8.4-common \
    php8.4-curl \
    php8.4-mbstring \
    php8.4-mysql \
    php8.4-pgsql \
    php8.4-sqlite3 \
    php8.4-zip \
    php8.4-gd \
    php8.4-intl \
    php8.4-bcmath \
    php8.4-exif \
    php8.4-opcache \
    php8.4-xml \
    php8.4-fileinfo \
    php8.4-soap \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js LTS (v22.x) and npm
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && rm -rf /var/lib/apt/lists/*

# Install Composer globally
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Create non-root Pterodactyl container user and group
RUN useradd -d /home/container -m -s /bin/bash container

# Configure directories & permissions for container user
RUN mkdir -p /home/container/public \
    /home/container/logs \
    /home/container/tmp \
    /home/container/nginx \
    /home/container/php \
    /home/container/startup \
    /run/php \
    /var/log/supervisor

# Set ownership to container user
RUN chown -R container:container /home/container \
    && chown -R container:container /run/php

# Expose standard Pterodactyl web hosting directory structure
WORKDIR /home/container

# Copy configuration templates and error pages into image
COPY --chown=container:container nginx/default.conf /home/container/nginx/default.conf.template
COPY --chown=container:container php/php.ini /home/container/php/php.ini
COPY --chown=container:container pages/ /home/container/pages/
COPY --chown=container:container startup.sh /home/container/startup.sh

RUN chmod +x /home/container/startup.sh

USER container

EXPOSE 8080

CMD ["/bin/bash", "/home/container/startup.sh"]
