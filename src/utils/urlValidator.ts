/**
 * Valida si una URL retorna un 404 y devuelve una URL alternativa si es necesario
 * @param originalUrl URL original a validar
 * @param fallbackUrl URL alternativa a usar si la original retorna 404
 * @returns Promise que resuelve con la URL válida
 */
export async function validateUrl(originalUrl: string, fallbackUrl: string): Promise<string> {
  // Verificar cache en localStorage (última validación válida por 1 hora)
  const cacheKey = `url_valid_${btoa(originalUrl)}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const cacheData = JSON.parse(cached);
      const now = Date.now();
      // Si el cache es válido (menos de 1 hora), usar la URL cacheada
      if (now - cacheData.timestamp < 3600000) {
        return cacheData.isValid ? originalUrl : fallbackUrl;
      }
    } catch {
      // Si hay error al parsear el cache, continuar con la validación
    }
  }

  try {
    // Crear un timeout de 3 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Intentar hacer un HEAD request para validar la URL
    const response = await fetch(originalUrl, {
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-cache',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Si la respuesta es exitosa (status 200-299) o no es 404, usar la URL original
    if (response.ok || response.status !== 404) {
      // Guardar en cache que la URL es válida
      localStorage.setItem(cacheKey, JSON.stringify({
        isValid: true,
        timestamp: Date.now()
      }));
      return originalUrl;
    } else {
      // Es un 404, usar la URL alternativa
      localStorage.setItem(cacheKey, JSON.stringify({
        isValid: false,
        timestamp: Date.now()
      }));
      return fallbackUrl;
    }
  } catch (error: any) {
    // Si hay error de CORS, timeout, o red, intentar validar de otra manera
    if (error.name === 'AbortError') {
      // Timeout - usar la alternativa
      console.warn(`Timeout validando URL ${originalUrl}, usando alternativa`);
      localStorage.setItem(cacheKey, JSON.stringify({
        isValid: false,
        timestamp: Date.now()
      }));
      return fallbackUrl;
    }

    // Si es un error de red o CORS, intentar una validación alternativa
    // usando no-cors (aunque no podemos leer el status, intentamos la conexión)
    try {
      const noCorsResponse = await fetch(originalUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
      });
      
      // Con no-cors siempre retorna opaque response (status 0)
      // No podemos determinar si es 404, pero al menos la conexión funciona
      // Por seguridad, usaremos la alternativa si hay problemas de CORS
      localStorage.setItem(cacheKey, JSON.stringify({
        isValid: false,
        timestamp: Date.now()
      }));
      return fallbackUrl;
    } catch (noCorsError) {
      // Si también falla con no-cors, definitivamente usar la alternativa
      console.warn(`Error validando URL ${originalUrl}, usando alternativa:`, error);
      localStorage.setItem(cacheKey, JSON.stringify({
        isValid: false,
        timestamp: Date.now()
      }));
      return fallbackUrl;
    }
  }
}

/**
 * Detecta el entorno actual (QA o producción)
 * @returns 'qa' | 'production' | 'local'
 */
function getEnvironment(): 'qa' | 'production' | 'local' {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || '';
  
  // Verificar si es QA basándose en la API URL
  if (apiUrl.includes('qa') || apiUrl.includes('QA')) {
    return 'qa';
  }
  
  // Verificar si es producción
  if (frontendUrl.includes('ineeoficial.com') || (!apiUrl.includes('qa') && apiUrl.includes('inee-backend.onrender.com'))) {
    return 'production';
  }
  
  // Por defecto, considerar local/desarrollo
  return 'local';
}

/**
 * Convierte una URL de ineeoficial.com según el entorno
 * - En QA: usa directamente tienda-qa.ineeoficial.com
 * - En producción: valida ineeoficial.com y usa inee-beta.web.app como fallback si retorna 404
 * - En local: valida y usa fallback si es necesario
 */
export async function getValidatedInEeUrl(path: string = ''): Promise<string> {
  const environment = getEnvironment();
  
  // En QA, usar directamente la URL de tienda QA
  if (environment === 'qa') {
    return `https://tienda-qa.ineeoficial.com${path}`;
  }
  
  // En producción o local, validar la URL original
  const originalUrl = `https://ineeoficial.com${path}`;
  const fallbackUrl = `https://inee-beta.web.app${path}`;
  
  // Si es producción, validar la URL
  if (environment === 'production') {
    return validateUrl(originalUrl, fallbackUrl);
  }
  
  // En local, por defecto usar la URL original (o validar según sea necesario)
  // Para desarrollo local, podríamos querer validar también
  return validateUrl(originalUrl, fallbackUrl);
}
