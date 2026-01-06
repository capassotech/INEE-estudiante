# INEE Tienda

Plataforma de alumnos INEE.

## 🚀 Inicio Rápido

```sh
# 1. Instalar dependencias
npm i

# 2. Configurar entorno (ver sección abajo)

# 3. Iniciar servidor de desarrollo
npm run dev
```

## 🔧 Configuración de Entornos (QA / Producción)

Este proyecto **ya tiene un archivo `.env`**. Solo necesitas **reemplazar su contenido** con la configuración que te proporcionen.

### ⚙️ Cómo Configurar el Entorno

1. **Abre** el archivo `.env` en este proyecto (`INEE-tienda/.env`)

2. **Comenta** todo el contenido actual 

3. **Copia** todo el contenido del archivo de configuración que te proporcionaron:
   - Para **QA**: archivo con variables de entorno de pruebas
   - Para **Producción**: archivo con variables de entorno de producción

4. **Pega** el contenido en el archivo `.env`


### 🔄 Cambiar de Entorno

Para cambiar entre QA y Producción, repite los pasos anteriores con el archivo de configuración del nuevo entorno.


### Verificar Entorno Actual

Para verificar qué entorno estás usando, revisa el archivo `.env` y busca:
- Si `VITE_FIREBASE_PROJECT_ID=inee-qa` → Estás en **QA**
- Si `VITE_FIREBASE_PROJECT_ID=tu-proyecto-prod` → Estás en **Producción**

## 🚢 Configuración para Despliegue (GitHub Actions)

Para que el despliegue automático funcione correctamente, necesitas configurar los **GitHub Secrets** con las mismas variables de entorno que tienes en tu archivo `.env`.

### 📋 Secrets Requeridos

Configura estos secrets en GitHub (Settings → Secrets and variables → Actions) con los **mismos nombres** que usas en tu `.env`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (opcional)

### 🔧 Cómo Configurar los Secrets

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Agrega cada variable con el **mismo nombre** que tienes en tu `.env` y su valor correspondiente
5. Repite para todas las variables

**Nota:** Los valores deben ser exactamente los mismos que tienes en tu archivo `.env` local. El workflow usará estas variables tanto para QA como para Producción.

## 📦 Tecnologías

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS



