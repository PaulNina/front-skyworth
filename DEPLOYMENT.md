# Guía de Despliegue para contabol.com

Dado que tu backend ya está funcionando en `https://contabol.com/api`, solo necesitamos subir el frontend y decirle al servidor que muestre los archivos visuales cuando entren a la página principal.

## 1. Construir el Frontend (En tu computadora)

Ya he creado el archivo `.env.production` configurado para `https://contabol.com`. Ahora solo genera los archivos finales:

1. Abrir terminal en la carpeta del proyecto.
2. Ejecutar:
   ```bash
   npm run build
   ```
   *Esto creará una carpeta llamada `dist` con todos los archivos optimizados.*

## 2. Subir Archivos al VPS

Necesitas copiar el contenido de la carpeta `dist` (de tu PC) al servidor.

1.  **Ruta recomendada en el VPS**: `/var/www/html` (o `/var/www/contabol`).
    *   *Nota: Si ya hay archivos ahí, es recomendable borrarlos o respaldarlos antes (excepto si hay carpetas del backend, ten cuidado).*

2.  **Método de subida**:
    *   Usa **FileZilla** o **WinSCP**.
    *   Conéctate a tu VPS.
    *   Navega a `/var/www/html`.
    *   Arrastra todo el **contenido** de tu carpeta `dist` local (index.html, assets, entc.) hacia esa carpeta remota.

## 3. Configurar Nginx (En el VPS)

Como ya tienes el backend funcionando, ya existe una configuración de Nginx. Debemos modificarla para que sirva el frontend.

1.  Entra al VPS por SSH.
2.  Edita la configuración de tu sitio (el nombre puede variar, revisa en `/etc/nginx/sites-enabled/`):
    ```bash
    # Ejemplo, busca el archivo correcto
    sudo nano /etc/nginx/sites-enabled/default
    # O tal vez se llame contabol
    ```

3.  **Busca el bloque `server` que tiene `server_name contabol.com;`**.
    Asegúrate de que tenga esta sección `location /` configurada así:

    ```nginx
    server {
        server_name contabol.com www.contabol.com;
        
        # ... configuración SSL existente ...

        # 1. ESTO ES LO NUEVO: Configuración del Frontend
        root /var/www/html; # <--- La carpeta donde subiste los archivos 'dist'
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # 2. ESTO YA DEBERÍA ESTAR (Backend)
        location /api/ {
            proxy_pass http://localhost:7000/api/; # O puerto 8080/otro según tu configuración actual
            # ... otras configuraciones de proxy existentes ...
        }
    }
    ```

4.  **Guardar y Reiniciar**:
    *   Guarda con `Ctrl+O`, sal con `Ctrl+X`.
    *   Verifica que no haya errores: `sudo nginx -t`
    *   Reinicia Nginx: `sudo systemctl restart nginx`

¡Listo! Al entrar a `https://contabol.com` deberías ver tu aplicación web.
