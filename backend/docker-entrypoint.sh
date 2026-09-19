#!/bin/sh

set -e

echo "Starting Laravel..."

if [ -z "${APP_KEY:-}" ]; then
    export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
    echo "APP_KEY generated."
fi

php artisan storage:link || true

echo "Running database migrations..."

php artisan migrate --force

echo "Starting Laravel server..."

exec php artisan serve \
    --host=0.0.0.0 \
    --port=8000