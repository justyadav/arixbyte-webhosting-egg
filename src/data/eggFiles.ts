import { ProjectFile, HostingPlan } from '../types';

export const EGG_FILES: ProjectFile[] = [
  {
    path: 'Dockerfile',
    name: 'Dockerfile',
    language: 'dockerfile',
    description: 'Production-optimized Docker image for ArixByte Web Hosting (Ubuntu 24.04, PHP 8.4, Nginx, Node.js LTS, Composer, Git).',
    content: `# ==============================================================================
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
RUN mkdir -p /home/container/public \\
    /home/container/logs \\
    /home/container/tmp \\
    /home/container/nginx \\
    /home/container/php \\
    /home/container/startup \\
    /run/php \\
    /var/log/supervisor

# Set ownership to container user
RUN chown -R container:container /home/container \\
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
`
  },
  {
    path: 'startup.sh',
    name: 'startup.sh',
    language: 'bash',
    description: 'Robust initialization and process manager script handling directory creation, permissions, Nginx template rendering, PHP-FPM, app type detection, and startup commands.',
    content: `#!/bin/bash
# ==============================================================================
# ArixByte Web Hosting - Pterodactyl Startup Script
# Handles directory setup, Nginx template substitution, PHP-FPM, and app runtime.
# ==============================================================================

cd /home/container

echo "========================================================"
echo "  ArixByte Web Hosting Engine (Pterodactyl Edition)     "
echo "========================================================"

# 1. Ensure required directory structure exists
mkdir -p /home/container/public
mkdir -p /home/container/logs
mkdir -p /home/container/tmp
mkdir -p /home/container/nginx
mkdir -p /home/container/php
mkdir -p /home/container/storage/framework/{sessions,views,cache}
mkdir -p /home/container/storage/logs

# 2. Set environment defaults if not provided
SERVER_PORT=\${SERVER_PORT:-8080}
APP_TYPE=\${APP_TYPE:-auto}
PHP_VERSION=\${PHP_VERSION:-8.4}
DOCUMENT_ROOT=\${DOCUMENT_ROOT:-/home/container/public}
RUN_COMPOSER_INSTALL=\${RUN_COMPOSER_INSTALL:-false}
RUN_NPM_INSTALL=\${RUN_NPM_INSTALL:-false}
RUN_NPM_BUILD=\${RUN_NPM_BUILD:-false}
STARTUP_CMD=\${STARTUP_CMD:-""}

echo "[ArixByte] Server Port: \${SERVER_PORT}"
echo "[ArixByte] Configured App Type: \${APP_TYPE}"
echo "[ArixByte] Document Root: \${DOCUMENT_ROOT}"

# 3. Automatic Application Detection if APP_TYPE is 'auto'
DETECTED_TYPE="static"
if [ "\${APP_TYPE}" = "auto" ]; then
    if [ -f "artisan" ]; then
        DETECTED_TYPE="laravel"
    elif [ -f "package.json" ]; then
        DETECTED_TYPE="node"
    elif [ -f "public/index.php" ] || [ -f "index.php" ]; then
        DETECTED_TYPE="php"
    elif [ -f "public/index.html" ] || [ -f "index.html" ]; then
        DETECTED_TYPE="static"
    fi
    echo "[ArixByte] Auto-detected application type: \${DETECTED_TYPE}"
    ACTIVE_TYPE="\${DETECTED_TYPE}"
else
    ACTIVE_TYPE="\${APP_TYPE}"
    echo "[ArixByte] Using forced application type: \${ACTIVE_TYPE}"
fi

# 4. Handle default landing pages if public directory is empty
if [ ! -f "/home/container/public/index.html" ] && [ ! -f "/home/container/public/index.php" ] && [ ! -f "index.php" ]; then
    echo "[ArixByte] No default index found. Deploying ArixByte welcome landing page..."
    cat << 'EOF' > /home/container/public/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ArixByte Web Hosting</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 3rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgb(0 0_0 / 0.3); text-align: center; max-width: 500px; border: 1px solid #334155; }
        h1 { color: #38bdf8; margin-bottom: 0.5rem; }
        p { color: #94a3b8; line-height: 1.6; }
        .badge { display: inline-block; background: #0369a1; color: #e0f2fe; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="card">
        <h1>ArixByte Web Hosting</h1>
        <p>Your Pterodactyl web server is successfully provisioned and online. Upload your files via SFTP or clone your repository to start building.</p>
        <div class="badge">Engine: Ready for Deployment</div>
    </div>
</body>
</html>
EOF
fi

# 5. Handle Composer dependencies if requested or detected
if [ "\${RUN_COMPOSER_INSTALL}" = "true" ] || [ -f "composer.json" -a "\${ACTIVE_TYPE}" = "laravel" ]; then
    if [ -f "composer.json" ]; then
        echo "[ArixByte] Running composer install..."
        composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist
    fi
fi

# 6. Handle Node.js npm install & build if requested
if [ "\${RUN_NPM_INSTALL}" = "true" ] || [ "\${ACTIVE_TYPE}" = "node" ]; then
    if [ -f "package.json" ]; then
        echo "[ArixByte] Running npm install..."
        npm install
        if [ "\${RUN_NPM_BUILD}" = "true" ] && grep -q "\"build\"" package.json; then
            echo "[ArixByte] Running npm run build..."
            npm run build
        fi
    fi
fi

# 7. Laravel specific setup (storage link, cache clear, permissions)
if [ "\${ACTIVE_TYPE}" = "laravel" ]; then
    echo "[ArixByte] Configuring Laravel environment..."
    if [ -f "artisan" ]; then
        php artisan config:cache
        php artisan route:cache
        php artisan storage:link --quiet || true
    fi
    chmod -R 775 storage bootstrap/cache 2>/dev/null || true
fi

# 8. Render Nginx Configuration Template using envsubst
echo "[ArixByte] Generating Nginx configuration for port \${SERVER_PORT}..."
export SERVER_PORT
export DOCUMENT_ROOT
envsubst '\${SERVER_PORT} \${DOCUMENT_ROOT}' < /home/container/nginx/default.conf.template > /home/container/nginx/default.conf

# 9. Start PHP-FPM in background
echo "[ArixByte] Starting PHP-FPM service..."
php-fpm8.4 -F -y /etc/php/8.4/fpm/php-fpm.conf &
PHP_FPM_PID=\$!

# 10. Start Nginx in background or Node.js in foreground depending on active type
if [ "\${ACTIVE_TYPE}" = "node" ]; then
    if [ -n "\${STARTUP_CMD}" ]; then
        echo "[ArixByte] Starting Node.js application with command: \${STARTUP_CMD}"
        exec \${STARTUP_CMD}
    else
        echo "[ArixByte] Starting Node.js with npm start..."
        exec npm start
    fi
else
    echo "[ArixByte] Starting Nginx web server..."
    nginx -c /home/container/nginx/default.conf -g 'daemon off;' &
    NGINX_PID=\$!

    echo "[ArixByte] ArixByte Web Hosting is fully online and serving traffic!"
    
    # Graceful shutdown handler
    trap "kill \${PHP_FPM_PID} \${NGINX_PID}; exit 0" SIGTERM SIGINT
    
    # Wait for processes
    wait \${PHP_FPM_PID} \${NGINX_PID}
fi
`
  },
  {
    path: 'nginx/default.conf',
    name: 'nginx/default.conf',
    language: 'nginx',
    description: 'Production Nginx server configuration template with dynamic port binding, PHP-FPM upstream, Laravel rewrites, and strict security rules.',
    content: `worker_processes auto;
pid /home/container/tmp/nginx.pid;
error_log /home/container/logs/nginx-error.log warn;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /home/container/logs/nginx-access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    client_max_body_size 100M;

    server {
        listen 0.0.0.0:\${SERVER_PORT};
        server_name _;

        root \${DOCUMENT_ROOT};
        index index.php index.html index.htm;

        # Custom error pages branded for ArixByte
        error_page 403 /errors/403.html;
        error_page 404 /errors/404.html;
        error_page 500 502 503 504 /errors/500.html;

        location = /errors/403.html {
            root /home/container/pages;
            internal;
        }
        location = /errors/404.html {
            root /home/container/pages;
            internal;
        }
        location = /errors/500.html {
            root /home/container/pages;
            internal;
        }

        # Prevent access to hidden files (.env, .git, composer.json, etc.)
        location ~ /\\.(?!well-known).* {
            deny all;
            return 403;
        }

        location ~* \\.(env|git|htaccess|htpasswd|ini|sh|sql|log|conf)$ {
            deny all;
            return 403;
        }

        location / {
            try_files \$uri \$uri/ /index.php?\$query_string;
        }

        # PHP-FPM FastCGI configuration
        location ~ \\.php\$ {
            try_files \$uri =404;
            fastcgi_split_path_info ^(.+\\.php)(/.+)\$;
            fastcgi_pass unix:/run/php/php8.4-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            fastcgi_param PATH_INFO \$fastcgi_path_info;
            fastcgi_intercept_errors on;
            fastcgi_buffer_size 16k;
            fastcgi_buffers 4 16k;
            fastcgi_connect_timeout 60s;
            fastcgi_send_timeout 180s;
            fastcgi_read_timeout 180s;
        }

        # Static asset caching
        location ~* \\.(jpg|jpeg|gif|png|css|js|ico|webp|svg|woff|woff2|ttf|eot)\$ {
            expires 30d;
            add_header Cache-Control "public, no-transform";
            try_files \$uri =404;
        }
    }
}
`
  },
  {
    path: 'php/php.ini',
    name: 'php/php.ini',
    language: 'ini',
    description: 'Production PHP 8.4 configuration tuned for web hosting, performance, security, and resource limits.',
    content: `[PHP]
engine = On
short_open_tag = Off
precision = 14
output_buffering = 4096
zlib.output_compression = Off
implicit_flush = Off
serialize_precision = -1
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,show_source,highlight_file
disable_classes =
zend.enable_gc = On
expose_php = Off
max_execution_time = 180
max_input_time = 180
memory_limit = 512M
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = /home/container/logs/php-error.log
default_charset = "UTF-8"

[Date]
date.timezone = "UTC"

[mail function]
SMTP = localhost
smtp_port = 25
mail.add_x_header = On

[SQL]
sql.safe_mode = Off

[ODBC]
odbc.allow_persistent = On
odbc.check_persistent = On
odbc.max_persistent = -1
odbc.max_links = -1
odbc.default_lrl = 4096
odbc.default_binmode = 1

[MySQLi]
mysqli.max_persistent = -1
mysqli.allow_persistent = On
mysqli.max_links = -1
mysqli.cache_size = 2000
mysqli.default_port = 3306

[Session]
session.save_handler = files
session.save_path = "/home/container/tmp"
session.use_strict_mode = 0
session.use_cookies = 1
session.use_only_cookies = 1
session.name = ARIXBYTESESSID
session.auto_start = 0
session.cookie_lifetime = 0
session.cookie_path = "/"
session.cookie_httponly = 1
session.serialize_handler = php
session.gc_probability = 1
session.gc_divisor = 1000
session.gc_maxlifetime = 1440

[Assertion]
assert.active = 1
assert.warning = 0
assert.exception = 1

[opcache]
opcache.enable = 1
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 8
opcache.max_accelerated_files = 10000
opcache.revalidate_freq = 2
opcache.fast_shutdown = 1
`
  },
  {
    path: 'pages/403.html',
    name: 'pages/403.html',
    language: 'html',
    description: 'Professional 403 Forbidden error page branded for ArixByte Web Hosting.',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 Forbidden - ArixByte Web Hosting</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .error-card { background: #1e293b; padding: 3rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3); text-align: center; max-width: 450px; border: 1px solid #334155; }
        .code { font-size: 4rem; font-weight: 800; color: #f59e0b; margin: 0 0 1rem 0; line-height: 1; }
        h1 { font-size: 1.5rem; margin-bottom: 0.75rem; color: #f8fafc; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
        .brand { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 600; }
    </style>
</head>
<body>
    <div class="error-card">
        <div class="code">403</div>
        <h1>Access Forbidden</h1>
        <p>You do not have permission to access this resource on this ArixByte web server.</p>
        <div class="brand">ArixByte Web Hosting</div>
    </div>
</body>
</html>
`
  },
  {
    path: 'pages/404.html',
    name: 'pages/404.html',
    language: 'html',
    description: 'Professional 404 Not Found error page branded for ArixByte Web Hosting.',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 Not Found - ArixByte Web Hosting</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .error-card { background: #1e293b; padding: 3rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3); text-align: center; max-width: 450px; border: 1px solid #334155; }
        .code { font-size: 4rem; font-weight: 800; color: #38bdf8; margin: 0 0 1rem 0; line-height: 1; }
        h1 { font-size: 1.5rem; margin-bottom: 0.75rem; color: #f8fafc; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
        .brand { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 600; }
    </style>
</head>
<body>
    <div class="error-card">
        <div class="code">404</div>
        <h1>Page Not Found</h1>
        <p>The requested page or asset could not be found on this ArixByte web server.</p>
        <div class="brand">ArixByte Web Hosting</div>
    </div>
</body>
</html>
`
  },
  {
    path: 'pages/500.html',
    name: 'pages/500.html',
    language: 'html',
    description: 'Professional 500 Internal Server Error page branded for ArixByte Web Hosting.',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 Internal Server Error - ArixByte Web Hosting</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .error-card { background: #1e293b; padding: 3rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3); text-align: center; max-width: 450px; border: 1px solid #334155; }
        .code { font-size: 4rem; font-weight: 800; color: #ef4444; margin: 0 0 1rem 0; line-height: 1; }
        h1 { font-size: 1.5rem; margin-bottom: 0.75rem; color: #f8fafc; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
        .brand { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 600; }
    </style>
</head>
<body>
    <div class="error-card">
        <div class="code">500</div>
        <h1>Internal Server Error</h1>
        <p>The server encountered an internal error or misconfiguration. Please check your application logs.</p>
        <div class="brand">ArixByte Web Hosting</div>
    </div>
</body>
</html>
`
  },
  {
    path: 'egg-arixbyte-webhosting.json',
    name: 'egg-arixbyte-webhosting.json',
    language: 'json',
    description: 'Complete, valid Pterodactyl PTDL_v1 Egg JSON configuration file ready for direct import into Pterodactyl Panel.',
    content: `{
    "_comment": "DO NOT EDIT: FILE GENERATED AUTOMATICALLY BY PTERODACTYL PANEL",
    "meta": {
        "version": "PTDL_v1",
        "update_url": null
    },
    "exported_at": "2026-03-30T00:00:00+00:00",
    "name": "ArixByte Web Hosting",
    "author": "support@arixbyte.com",
    "description": "Production-ready web hosting egg for ArixByte supporting Static HTML, PHP, Laravel, and Node.js applications.",
    "features": [
        "php:8.4",
        "nginx",
        "nodejs",
        "composer",
        "git"
    ],
    "images": [
        "ghcr.io/arixbyte/web-hosting:latest"
    ],
    "file_denylist": [],
    "startup": "bash /home/container/startup.sh",
    "config": {
        "files": "{\\\"nginx/default.conf\\\":{\\\"parser\\\":\\\"file\\\",\\\"update\\\":true}}",
        "startup": "{\\\"done\\\":\\\"ArixByte Web Hosting is fully online and serving traffic!\\\"}",
        "logs": "{\\\"custom\\\":true,\\\"location\\\":\\\"logs/nginx-error.log\\\"}",
        "stop": "^C"
    },
    "scripts": {
        "installation": {
            "script": "#!/bin/bash\\napt-get update && apt-get install -y curl git unzip\\necho 'ArixByte Web Hosting container base prepared successfully.'",
            "container": "ubuntu:24.04",
            "entrypoint": "bash"
        }
    },
    "variables": [
        {
            "name": "Application Type",
            "description": "Automatic detection or forced runtime (auto, static, php, laravel, node)",
            "env_variable": "APP_TYPE",
            "default_value": "auto",
            "user_viewable": "1",
            "user_editable": "1",
            "rules": "required|string|in:auto,static,php,laravel,node"
        },
        {
            "name": "Startup Command",
            "description": "Custom startup command for Node.js or custom web apps (e.g. npm start)",
            "env_variable": "STARTUP_CMD",
            "default_value": "",
            "user_viewable": "1",
            "user_editable": "1",
            "rules": "nullable|string"
        },
        {
            "name": "PHP Version",
            "description": "PHP version used by the container",
            "env_variable": "PHP_VERSION",
            "default_value": "8.4",
            "user_viewable": "1",
            "user_editable": "0",
            "rules": "required|string"
        },
        {
            "name": "Document Root",
            "description": "Public web document root directory relative to container",
            "env_variable": "DOCUMENT_ROOT",
            "default_value": "/home/container/public",
            "user_viewable": "1",
            "user_editable": "1",
            "rules": "required|string"
        },
        {
            "name": "Run Composer Install",
            "description": "Automatically run composer install on startup if composer.json exists",
            "env_variable": "RUN_COMPOSER_INSTALL",
            "default_value": "false",
            "user_viewable": "1",
            "user_editable": "1",
            "rules": "required|string|in:true,false"
        },
        {
            "name": "Run NPM Install",
            "description": "Automatically run npm install on startup if package.json exists",
            "env_variable": "RUN_NPM_INSTALL",
            "default_value": "false",
            "user_viewable": "1",
            "user_editable": "1",
            "rules": "required|string|in:true,false"
        },
        {
            "name": "Run NPM Build",
            "description": "Automatically run npm run build on startup if build script exists",
            "env_variable": "RUN_NPM_BUILD",
            "default_value": "false",
            "user_viewable": "1",
            "user_editable": "1",
            "rules": "required|string|in:true,false"
        }
    ]
}`
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    description: 'Comprehensive documentation for ArixByte Pterodactyl Web Hosting Egg.',
    content: `# ArixByte Web Hosting Egg for Pterodactyl

Production-grade, secure, and multi-tenant web hosting egg designed specifically for **ArixByte** and Pterodactyl Panel + Wings.

## Supported Stack
* **Web Server**: Nginx (listening on \`0.0.0.0:\${SERVER_PORT}\`)
* **PHP**: PHP 8.4 + PHP-FPM with all modern web & framework extensions
* **Node.js**: Node.js LTS (v22.x) & npm
* **Composer**: Global Composer package manager
* **Git**: Integrated Git repository cloning
* **Frameworks**: First-class support for Laravel, WordPress, custom PHP, static HTML, and Node.js web apps.

---

## Directory Structure
\`\`\`
/home/container/
├── public/          <-- Default document root
├── logs/            <-- Nginx & PHP error/access logs
├── tmp/             <-- Temporary session and upload storage
├── nginx/           <-- Generated Nginx configs
├── php/             <-- PHP ini overrides
└── startup/         <-- Startup scripts & error pages
\`\`\`
`
  },
  {
    path: '.dockerignore',
    name: '.dockerignore',
    language: 'dockerignore',
    description: 'Docker ignore file for clean builds.',
    content: `node_modules
vendor
.git
.env
logs/
tmp/
*.log
.DS_Store
`
  }
];

export const HOSTING_PLANS: HostingPlan[] = [
  {
    name: 'ArixByte Starter Web',
    cpu: '100% (1 vCore)',
    ram: '1 GB',
    disk: '10 GB NVMe',
    io: '50 MB/s',
    idealFor: 'Static HTML portfolios, personal blogs, lightweight PHP landing pages.'
  },
  {
    name: 'ArixByte Pro Web',
    cpu: '200% (2 vCores)',
    ram: '2 GB',
    disk: '25 GB NVMe',
    io: '100 MB/s',
    idealFor: 'Laravel applications, WordPress sites with plugins, medium traffic PHP/Node sites.'
  },
  {
    name: 'ArixByte Business Web',
    cpu: '400% (4 vCores)',
    ram: '4 GB',
    disk: '50 GB NVMe',
    io: '250 MB/s',
    idealFor: 'High-traffic e-commerce stores, SaaS web frontends, complex Laravel APIs.'
  },
  {
    name: 'ArixByte Enterprise Web',
    cpu: '800% (8 vCores)',
    ram: '8 GB',
    disk: '100 GB NVMe',
    io: '500 MB/s',
    idealFor: 'Mission-critical enterprise web apps, high-concurrency Node.js microservices.'
  }
];
