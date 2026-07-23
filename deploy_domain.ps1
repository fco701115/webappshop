$hostName = "13.140.153.222"
$user = "root"
$password = "fco8523al"
$domain = "www.compuequipo.shop"

Write-Host "=== Desplegando dominio $domain en $hostName ===" -ForegroundColor Cyan

# Crear proceso SSH con redireccion de E/S
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "ssh"
$psi.Arguments = "-o StrictHostKeyChecking=no $user@$hostName"
$psi.UseShellExecute = $false
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.CreateNoWindow = $true

$proc = [System.Diagnostics.Diagnostics.Process]::Start($psi)

# Esperar prompt de contrasena
Start-Sleep -Seconds 5
$proc.StandardInput.WriteLine($password)
$proc.StandardInput.Flush()
Start-Sleep -Seconds 3

# Comandos SSH para configurar el servidor
$commands = @(
    # Actualizar e instalar Nginx y Certbot
    "apt-get update && apt-get install -y nginx certbot python3-certbot-nginx",
    
    # Clonar el repositorio
    "rm -rf /var/www/webvermart",
    "git clone https://github.com/fco701115/webvermart.git /var/www/webvermart",
    
    # Instalar dependencias Node.js
    "cd /var/www/webvermart && npm install --production",
    
    # Crear archivo de configuracion Nginx
    "cat > /etc/nginx/sites-available/$domain << 'NGINX_EOF'
server {
    listen 80;
    server_name $domain compuequipo.shop;

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
NGINX_EOF",
    
    # Activar el sitio
    "ln -sf /etc/nginx/sites-available/$domain /etc/nginx/sites-enabled/",
    "rm -f /etc/nginx/sites-enabled/default",
    
    # Verificar configuracion Nginx
    "nginx -t",
    
    # Reiniciar Nginx
    "systemctl restart nginx",
    "systemctl enable nginx",
    
    # Configurar SSL con Certbot (Let's Encrypt)
    "certbot --nginx -d $domain -d compuequipo.shop --non-interactive --agree-tos --email admin@compuequipo.shop --redirect",
    
    # Verificar que la app Node.js esta corriendo
    "cd /var/www/webvermart && pm2 delete webvermart 2>/dev/null; pm2 start server.js --name webvermart",
    "pm2 save",
    "pm2 startup",
    
    # Abrir puertos en firewall
    "ufw allow 80/tcp",
    "ufw allow 443/tcp",
    
    "echo DESPLIEGUE_COMPLETADO"
)

foreach ($cmd in $commands) {
    Write-Host "Ejecutando: $cmd" -ForegroundColor Gray
    $proc.StandardInput.WriteLine($cmd)
    $proc.StandardInput.Flush()
    Start-Sleep -Seconds 3
}

$proc.StandardInput.WriteLine("exit")
$proc.StandardInput.Flush()

$proc.WaitForExit(120000)

Write-Host "`n=== STDOUT ===" -ForegroundColor Green
Write-Host $proc.StandardOutput.ReadToEnd()
Write-Host "`n=== STDERR ===" -ForegroundColor Red
Write-Host $proc.StandardError.ReadToEnd()

Write-Host "`n=== Despliegue completado ===" -ForegroundColor Green
Write-Host "Tu sitio estara disponible en: https://$domain" -ForegroundColor Yellow
