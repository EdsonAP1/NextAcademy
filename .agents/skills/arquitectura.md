# Prompt para Desarrollo Web: Arquitectura de Software & Ciberseguridad Full-Stack

Este documento contiene un prompt altamente optimizado y estructurado para ser utilizado con modelos de Inteligencia Artificial (LLMs) con el objetivo de generar un esqueleto base seguro para un proyecto de desarrollo web moderno.

---

## 🎯 Instrucciones de Rol y Enfoque

Actúa como un **Arquitecto de Software** y **Especialista en Ciberseguridad Full-Stack Senior**. Necesito que crees la estructura inicial completa para un proyecto llamado `NextAcademy` utilizando un enfoque de **Monorrepo con Arquitectura Desacoplada (Cliente-Servidor)**.

---

## 📂 Estructura de Carpetas Requerida

```text
 NextAcademy/
├── frontend/             # React con TypeScript y Vite
├── backend/              # NestJS con TypeScript y Prisma ORM
├── docker-compose.yml    # En la raíz, para base de datos PostgreSQL
└── package.json          # En la raíz, para gestionar el monorrepo (npm workspaces / concurrently)
```

---

## 🛡️ "Escudo de Seguridad" desde la Base

El proyecto debe incluir las siguientes directrices de seguridad desde su configuración inicial:

### 1. Frontend (Protección XSS y Manejo de Sesiones)
* **Almacenamiento de Tokens:** Configura la arquitectura para que el token JWT **NO** se almacene en `localStorage`, `sessionStorage` ni en el estado global expuesto de la aplicación.
* **Flujo de Cookies:** Las peticiones de autenticación deben configurarse para recibir y enviar credenciales de forma automática mediante **Cookies Seguras** con las siguientes propiedades:
  * `httpOnly` (evita acceso vía JavaScript / mitigación XSS).
  * `Secure` (solo transmisión sobre HTTPS).
  * `SameSite=Lax` o `Strict` (mitigación CSRF).

### 2. Backend (Autenticación y Encriptación)
* **Firma de Tokens:** Configura la base para utilizar `@nestjs/jwt` para la generación de pases temporales firmados criptográficamente.
* **Cifrado de Contraseñas:** Implementa `bcrypt` (o `bcryptjs`) para el hashing irreversible y robusto de contraseñas con un factor de sal (*salt rounds*) adecuado, antes de persistirlas en PostgreSQL mediante Prisma ORM.

### 3. Backend (Control de Acceso - CORS Estricto)
* **Configuración en NestJS:** Configura el archivo `main.ts` de NestJS habilitando CORS de forma estricta.
* **Restricciones:** 
  * Permite únicamente el origen específico de la URL de desarrollo del Frontend (ej. `http://localhost:5173`).
  * Activa obligatoriamente `credentials: true` para permitir el correcto flujo de cookies `httpOnly` en las peticiones cross-origin.

### 4. Backend (Mitigación de Bots y Fuerza Bruta)
* **Rate Limiting:** Integra el módulo oficial `@nestjs/throttler` en el backend para limitar el número de peticiones por IP en un intervalo de tiempo.
* **Protección de Endpoints Sensibles:** Diseña la base para proteger de forma estricta las futuras rutas de autenticación (`/auth/login`, `/auth/register`) contra ataques de fuerza bruta y denegación de servicio (DoS) básicos.

### 5. Base de Datos (Aislamiento y Credenciales)
* **Dockerización:** Configura el archivo `docker-compose.yml` en la raíz para levantar un contenedor de PostgreSQL.
* **Parametrización:** Todas las credenciales de la base de datos (usuario, contraseña, puerto, nombre de BD) deben estar estrictamente parametrizadas en un archivo `.env` en la raíz (y cargadas a través de variables de entorno).

---

## 📋 Entregables Requeridos

### A. Código Limpio, Modular y Bien Estructurado de los Archivos Clave:
1. **`docker-compose.yml`** configurado para PostgreSQL.
2. **`package.json`** de la raíz para la gestión unificada de workspaces o scripts concurrentes.
3. **`main.ts`** de NestJS con la inicialización correcta de CORS, cookies y Throttler.
4. **Módulo/Servicio de Seguridad en NestJS** (configuración de Jwt, Throttler y Prisma).
5. **Ejemplo de cliente Axios/Fetch en React** configurado explícitamente con `withCredentials: true` e interceptores de seguridad.

### B. Guía de Ejecución y Comandos de Terminal:
* La lista exacta de comandos de terminal paso a paso para:
  1. Inicializar la estructura de carpetas.
  2. Instalar todas las dependencias necesarias tanto para producción como para desarrollo de TypeScript (incluyendo los paquetes de tipos `@types/...`).
  3. Poner en marcha todo el ecosistema (BD, Backend y Frontend) de forma segura en un entorno de desarrollo local.