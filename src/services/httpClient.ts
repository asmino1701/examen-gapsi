import { apiConfig } from '../config/api.config';

/**
 * Error tipado de HTTP - permite distinguir errores de red vs respuesta.
 *
 * No usamos parameter properties (public/readonly en constructor) porque
 * `erasableSyntaxOnly: true` del tsconfig lo prohíbe: esa sintaxis no es
 * borrable por TS y emite JS real. Declaramos campos y asignamos manual.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
  }
}

/**
 * Cliente HTTP minimalista.
 *
 * Centraliza:
 * - Headers comunes (x-rapidapi-key, x-rapidapi-host)
 * - Construcción de URL con query params
 * - Manejo uniforme de errores
 * - Timeout vía AbortController
 *
 * No usamos axios porque fetch nativo es suficiente y ahorra ~13KB de bundle.
 */
export async function httpGet<T>(
  path: string,
  params: Record<string, string | number> = {},
  options: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<T> {
  const url = new URL(path, apiConfig.baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 15_000
  );

  // Combinamos el signal externo (de React Query) con nuestro timeout
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiConfig.rapidApiKey,
        'x-rapidapi-host': apiConfig.rapidApiHost,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new HttpError(
        `Request failed: ${response.statusText}`,
        response.status,
        url.toString()
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}