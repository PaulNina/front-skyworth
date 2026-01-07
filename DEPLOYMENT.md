# Guia de Despliegue en VPS (Ubuntu/Linux)

Esta guía detalla los pasos para desplegar el frontend de React (Vite) y el backend en un mismo VPS, usando Nginx como servidor web y proxy reverso con SSL (HTTPS).

## 1. Preparación del Frontend (Local)

Antes de subir los archivos al VPS, debes preparar la aplicación para producción.

### Configurar URL del Backend
Para producción, el frontend NO puede buscar el backend en `localhost`, debe apuntar a tu dominio.

1. Crea un archivo `.env.production` en la raíz del proyecto:
   ```env
   VITE_API_URL=https://tu-dominio.com
   ```
   *(Reemplaza `tu-dominio.com` por tu dominio real)*.

2. Genera los archivos estáticos:
   ```bash
   npm run build
   ```
   Esto creará una carpeta `dist/` con todo tu sitio web listo para subir.

## 2. Configuración del VPS

Asumimos que tienes acceso SSH a tu servidor Ubuntu.

### Instalar Nginx y Certbot
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

### Subir Archivos
Sube el contenido de la carpeta `dist/` generada en tu PC a la ruta `/var/www/skyworth` en el VPS (puedes usar FileZilla o SCP).

## 3. Configuración de Nginx

Esta configuración servirá tu frontend y redirigirá las llamadas de `/api` a tu backend que corre en el puerto 7000.

1. Crear archivo de configuración:
   ```bash
   sudo nano /etc/nginx/sites-available/skyworth
   ```

2. Pegar la siguiente configuración:

   ```nginx
   server {
       server_name tu-dominio.com www.tu-dominio.com;

       root /var/www/skyworth;
       index index.html;

       # Frontend (React Router)
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Backend (Proxy Reverso)
       location /api/ {
           proxy_pass http://localhost:7000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Activar el sitio:
   ```bash
   sudo ln -s /etc/nginx/sites-available/skyworth /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 4. Configuración SSL (HTTPS)

Certbot configurará automáticamente el SSL gratuito de Let's Encrypt.

```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

Sigue las instrucciones en pantalla.

## 5. Backend

Asegúrate de que tu backend (Java/Spring Boot) esté corriendo en el puerto 7000 en el VPS.
```bash
java -jar tu-backend.jar
```
*(Recomendamos usar Docker o un servicio systemd para mantener el backend corriendo siempre)*.
