#!/bin/bash
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
SERVER_PORT=${SERVER_PORT:-8080}
APP_TYPE=${APP_TYPE:-auto}
PHP_VERSION=${PHP_VERSION:-8.4}
DOCUMENT_ROOT=${DOCUMENT_ROOT:-/home/container/public}
RUN_COMPOSER_INSTALL=${RUN_COMPOSER_INSTALL:-false}
RUN_NPM_INSTALL=${RUN_NPM_INSTALL:-false}
RUN_NPM_BUILD=${RUN_NPM_BUILD:-false}
STARTUP_CMD=${STARTUP_CMD:-""}

echo "[ArixByte] Server Port: ${SERVER_PORT}"
echo "[ArixByte] Configured App Type: ${APP_TYPE}"
echo "[ArixByte] Document Root: ${DOCUMENT_ROOT}"

# 3. Automatic Application Detection if APP_TYPE is 'auto'
DETECTED_TYPE="static"
if [ "${APP_TYPE}" = "auto" ]; then
    if [ -f "artisan" ]; then
        DETECTED_TYPE="laravel"
    elif [ -f "package.json" ]; then
        DETECTED_TYPE="node"
    elif [ -f "public/index.php" ] || [ -f "index.php" ]; then
        DETECTED_TYPE="php"
    elif [ -f "public/index.html" ] || [ -f "index.html" ]; then
        DETECTED_TYPE="static"
    fi
    echo "[ArixByte] Auto-detected application type: ${DETECTED_TYPE}"
    ACTIVE_TYPE="${DETECTED_TYPE}"
else
    ACTIVE_TYPE="${APP_TYPE}"
    echo "[ArixByte] Using forced application type: ${ACTIVE_TYPE}"
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
        .card { background: #1e293b; padding: 3rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3); text-align: center; max-width: 500px; border: 1px solid #334155; }
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
if [ "${RUN_COMPOSER_INSTALL}" = "true" ] || [ -f "composer.json" -a "${ACTIVE_TYPE}" = "laravel" ]; then
    if [ -f "composer.json" ]; then
        echo "[ArixByte] Running composer install..."
        composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist
    fi
fi

# 6. Handle Node.js npm install & build if requested
if [ "${RUN_NPM_INSTALL}" = "true" ] || [ "${ACTIVE_TYPE}" = "node" ]; then
    if [ -f "package.json" ]; then
        echo "[ArixByte] Running npm install..."
        npm install
        if [ "${RUN_NPM_BUILD}" = "true" ] && grep -q "\"build\"" package.json; then
            echo "[ArixByte] Running npm run build..."
            npm run build
        fi
    fi
fi

# 7. Laravel specific setup (storage link, cache clear, permissions)
if [ "${ACTIVE_TYPE}" = "laravel" ]; then
    echo "[ArixByte] Configuring Laravel environment..."
    if [ -f "artisan" ]; then
        php artisan config:cache
        php artisan route:cache
        php artisan storage:link --quiet || true
    fi
    chmod -R 775 storage bootstrap/cache 2>/dev/null || true
fi

# 8. Render Nginx Configuration Template using envsubst
echo "[ArixByte] Generating Nginx configuration for port ${SERVER_PORT}..."
export SERVER_PORT
export DOCUMENT_ROOT
envsubst '${SERVER_PORT} ${DOCUMENT_ROOT}' < /home/container/nginx/default.conf.template > /home/container/nginx/default.conf

# 9. Start PHP-FPM in background
echo "[ArixByte] Starting PHP-FPM service..."
php-fpm8.4 -F -y /etc/php/8.4/fpm/php-fpm.conf &
PHP_FPM_PID=$!

# 10. Start Nginx in background or Node.js in foreground depending on active type
if [ "${ACTIVE_TYPE}" = "node" ]; then
    if [ -n "${STARTUP_CMD}" ]; then
        echo "[ArixByte] Starting Node.js application with command: ${STARTUP_CMD}"
        exec ${STARTUP_CMD}
    else
        echo "[ArixByte] Starting Node.js with npm start..."
        exec npm start
    fi
else
    echo "[ArixByte] Starting Nginx web server..."
    nginx -c /home/container/nginx/default.conf -g 'daemon off;' &
    NGINX_PID=$!

    echo "[ArixByte] ArixByte Web Hosting is fully online and serving traffic!"
    
    # Graceful shutdown handler
    trap "kill ${PHP_FPM_PID} ${NGINX_PID}; exit 0" SIGTERM SIGINT
    
    # Wait for processes
    wait ${PHP_FPM_PID} ${NGINX_PID}
fi
