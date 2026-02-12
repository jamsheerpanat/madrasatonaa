#!/bin/bash

# Configuration
SERVER_IP="76.13.76.173"
SERVER_USER="root"
SSH_KEY="~/.ssh/id_rsa_madrasatonaa"
LOCAL_API_DIR="services/api"
REMOTE_API_DIR="/var/www/madrasatonaa/services/api"
PRODUCTION_DB_BACKUP="services/api/database/production_base.sqlite"
REMOTE_WEB_DIR="/var/www/madrasatonaa/apps/web"

echo "🚀 Starting Deployment Process..."

# 1. Sync Code to Server
echo "📦 Syncing code to GitHub and Server..."
git add .
git commit -m "Deployment Sync: $(date)" || echo "No changes to commit"
git push origin main

# 2. Upload Base Production Database (Resetting Server Data)
echo "🔄 Overwriting Server Database with Clean Base..."
cp "$LOCAL_API_DIR/database/database.sqlite" "$PRODUCTION_DB_BACKUP"

if [ -f "$PRODUCTION_DB_BACKUP" ]; then
    rsync -avz -e "ssh -i $SSH_KEY" "$PRODUCTION_DB_BACKUP" "$SERVER_USER@$SERVER_IP:$REMOTE_API_DIR/database/database.sqlite"
else
    echo "❌ Error: production_base.sqlite not found! Run migration locally first."
    exit 1
fi

# 3. Server Deployment Commands
echo "🔧 Running Server Deployment Scripts..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP <<EOF
    # API Setup
    cd $REMOTE_API_DIR
    git reset --hard HEAD
    git pull origin main
    
    # Ensure correct permissions for DB and Storage
    chmod -R 777 storage bootstrap/cache database
    chown -R www-data:www-data storage bootstrap/cache database
    
    # Run any pending migrations (safeguard, though DB is replaced)
    php8.4 artisan migrate --force
    
    # Cache Config
    php8.4 artisan config:cache
    php8.4 artisan route:cache

    # Frontend Setup
    cd $REMOTE_WEB_DIR
    # We rebuild next.js to ensure latest code is active
    npm install
    # Ensure .env.local exists
    echo "NEXT_PUBLIC_API_BASE_URL=http://$SERVER_IP:8081/api/v1" > .env.local
    npm run build
    pm2 restart madrasatonaa-web

    # Restart Nginx/PHP to be safe
    systemctl reload nginx
    service php8.4-fpm reload
EOF

echo "✅ Deployment Complete! Server is now synced with local base state."
