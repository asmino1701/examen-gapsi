import { useCallback, useContext, useMemo } from 'react';
import { CartContext } from '../context/CartContext';
import type { Product } from '../types/product';

/**
 * Patrón Facade (GoF). Combina useContext, useReducer y un Map interno
 * detrás de una API plana (addToCart, removeFromCart, resetCart, isInCart).
 * Los componentes consumidores no conocen la implementación.
 */

export interface UseCartResult {
  items: Product[];
  count: number;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  resetCart: () => void;
  isInCart: (id: string) => boolean;
}

export function useCart(): UseCartResult {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de <CartProvider>');
  }

  const { state, dispatch } = ctx;

  const items = useMemo<Product[]>(
    () => Array.from(state.items.values()),
    [state.items]
  );

  const addToCart = useCallback(
    (product: Product) => dispatch({ type: 'ADD', payload: product }),
    [dispatch]
  );

  const removeFromCart = useCallback(
    (id: string) => dispatch({ type: 'REMOVE', payload: { id } }),
    [dispatch]
  );

  const resetCart = useCallback(() => dispatch({ type: 'RESET' }), [dispatch]);

  const isInCart = useCallback(
    (id: string) => state.items.has(id),
    [state.items]
  );

  return {
    items,
    count: items.length,
    addToCart,
    removeFromCart,
    resetCart,
    isInCart,
  };
}