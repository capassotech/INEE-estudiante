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

## 📦 Tecnologías

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS



