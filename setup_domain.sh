#!/bin/bash
# Script para configurar el dominio www.compuequipo.shop
# Ejecutar en el servidor: bash setup_domain.sh

set -e

DOMAIN="www.compuequipo.shop"
EMAIL="admin@compuequipo.shop"

echo "=== Configurando dominio $DOMAIN ==="

# Instalar dependencias
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx git nodejs npm pm2

# Clonar repositorio
rm -rf /var/www/webvermart
git clone https://github.com/fco701115/webvermart.git /var/www/webvermart
cd /var/www/webvermart
npm install --production

# Configurar Nginx
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN compuequipo.shop;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Activar sitio
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar y reiniciar Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# Configurar SSL
certbot --nginx -d $DOMAIN -d compuequipo.shop --non-interactive --agree-tos --email $EMAIL --redirect

# Iniciar app con PM2
pm2 delete webvermart 2>/dev/null || true
pm2 start server.js --name webvermart
pm2 save
pm2 startup

# Firewall
ufw allow 80/tcp
ufw allow 443/tcp

echo "=== Configuracion completada ==="
echo "Sitio disponible en: https://$DOMAIN"
