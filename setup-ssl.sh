#!/bin/bash

# Configuration
DOMAINS="kurniadi.dev www.kurniadi.dev"
EMAIL="kurniadiahmadwijaya@gmail.com"

echo "Starting Nginx to handle ACME challenge..."
docker-compose up -d nginx

echo "Requesting Let's Encrypt certificate for $DOMAINS..."
docker-compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    $(for d in $DOMAINS; do echo "-d $d"; done)

echo "Done! If successful, please edit your nginx config to uncomment the HTTPS block and run 'docker-compose restart nginx'"
