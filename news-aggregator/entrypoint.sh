#!/bin/bash

# Wait for MySQL to be ready
max_retries=20
attempt=1
until mysql -u root -h mysql -p"${DB_PASSWORD}" -e "SELECT 1;" > /dev/null 2>&1 || [ $attempt -gt $max_retries ]; do
    echo "Waiting for MySQL to be ready... (Attempt $attempt)"
    attempt=$((attempt+1))
    sleep 5
done

if [ $attempt -gt $max_retries ]; then
    echo "MySQL is not ready after $max_retries attempts. Exiting."
    exit 1
fi

echo "MySQL is ready."

# Wait for Meilisearch to be ready
attempt=1
until curl -sf http://meilisearch:7700/health > /dev/null || [ $attempt -gt $max_retries ]; do
    echo "Waiting for Meilisearch to be ready... (Attempt $attempt)"
    attempt=$((attempt+1))
    sleep 5
done

if [ $attempt -gt $max_retries ]; then
    echo "Meilisearch is not ready after $max_retries attempts. Exiting."
    exit 1
fi

echo "Meilisearch is ready."

# Run Laravel setup
php artisan migrate --force
php artisan db:seed --force
echo "Laravel setup completed."

# Start Laravel's development server in the background
php artisan serve --host=0.0.0.0 --port=8000 &
laravel_pid=$!

# Wait for Laravel server to be ready
attempt=1
until curl -sf http://127.0.0.1:8000 > /dev/null || [ $attempt -gt $max_retries ]; do
    echo "Waiting for Laravel server to be ready... (Attempt $attempt)"
    attempt=$((attempt+1))
    sleep 5
done

if [ $attempt -gt $max_retries ]; then
    echo "Laravel server is not ready after $max_retries attempts. Exiting."
    kill $laravel_pid
    exit 1
fi

echo "Laravel server is ready."

# Run the initial fetch commands
curl http://127.0.0.1:8000/fetch-articles
curl http://127.0.0.1:8000/fetch-guardian-articles
curl http://127.0.0.1:8000/fetch-ny-articles

# Set up cron jobs to run every hour
echo "0 * * * * curl http://127.0.0.1:8000/fetch-articles
0 * * * * curl http://127.0.0.1:8000/fetch-guardian-articles
0 * * * * curl http://127.0.0.1:8000/fetch-ny-articles" > /etc/cron.d/fetch-articles

# Apply cron jobs
crontab /etc/cron.d/fetch-articles

# Start cron
cron
echo "cron started."

# Keep Laravel server running
wait $laravel_pid
