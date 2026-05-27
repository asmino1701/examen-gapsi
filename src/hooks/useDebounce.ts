import { useEffect, useState } from 'react';

/**
 * Debounce de un valor. Retorna el valor con `delay` ms de retraso
 * desde la última actualización.
 *
 * Uso típico: input de búsqueda. Sin debounce, escribir "nintendo"
 * dispara 8 llamadas al API; con 400ms de debounce, dispara 1
 * (al terminar de escribir).
 *
 * @param value valor a debouncear
 * @param delay ms de espera (400 es un buen default para search)
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    // Cada vez que `value` cambia, programamos actualizar `debounced`
    // luego de `delay`. Si `value` cambia antes del timeout,
    // el cleanup lo cancela y reinicia el conteo.
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}