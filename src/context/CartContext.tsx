import { createContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { Product } from '../types/product';

/**
 * Map en lugar de array: lookup O(1) para isInCart, y elimina duplicados
 * estructuralmente. Map preserva orden de inserción en ES2015+.
 */
export interface CartState {
  items: Map<string, Product>;
}

export type CartAction =
  | { type: 'ADD'; payload: Product }
  | { type: 'REMOVE'; payload: { id: string } }
  | { type: 'RESET' };

const initialState: CartState = {
  items: new Map(),
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      if (state.items.has(action.payload.id)) return state;
      const next = new Map(state.items);
      next.set(action.payload.id, action.payload);
      return { items: next };
    }
    case 'REMOVE': {
      if (!state.items.has(action.payload.id)) return state;
      const next = new Map(state.items);
      next.delete(action.payload.id);
      return { items: next };
    }
    case 'RESET': {
      if (state.items.size === 0) return state;
      return { items: new Map() };
    }
  }
}

interface CartContextValue {
  state: CartState;
  dispatch: Dispatch<CartAction>;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}