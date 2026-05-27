/**
 * Configuración centralizada del API.
 *
 * Archivo de configuración separado (buena práctica - peso 2).
 * Si cambian endpoints o headers, solo se modifica este archivo.
 *
 * Las variables VITE_* son inyectadas por Vite en build-time.
 * IMPORTANTE: en un frontend, las API keys son visibles en el bundle.
 * Para producción real, este endpoint debería pasar por un BFF/proxy.
 */

interface ApiConfig {
  baseUrl: string;
  rapidApiKey: string;
  rapidApiHost: string;
  endpoints: {
    walmartSearch: string;
  };
  defaultPageSize: number;
}

const requireEnv = (key: string, value: string | undefined): string => {
  if (!value) {
    // No lanzamos error en runtime para no romper el dev server,
    // pero sí lo logueamos visiblemente.
    console.warn(
      `[api.config] La variable de entorno ${key} no está definida. ` +
        `Crea un archivo .env basado en .env.example.`
    );
    return '';
  }
  return value;
};

export const apiConfig: ApiConfig = {
  baseUrl: requireEnv('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
  rapidApiKey: requireEnv('VITE_RAPIDAPI_KEY', import.meta.env.VITE_RAPIDAPI_KEY),
  rapidApiHost: requireEnv('VITE_RAPIDAPI_HOST', import.meta.env.VITE_RAPIDAPI_HOST),
  endpoints: {
    walmartSearch: '/wlm/walmart-search-by-keyword',
  },
  defaultPageSize: 20,
};