import { useRef, useEffect, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Box, CircularProgress, Typography, Alert, useMediaQuery, useTheme } from '@mui/material';
import { ProductCard } from './ProductCard';
import type { Product } from '../types/product';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: Error | null;
  onFetchNextPage: () => void;
  onAddToCart: (product: Product) => void;
  /** Filtro de productos a OCULTAR (los que ya están en el carrito) */
  hiddenIds: Set<string>;
  /** Mensaje cuando no hay búsqueda activa */
  emptyMessage?: string;
}

const ROW_HEIGHT = 320; // px - altura aproximada de una fila de cards
const GAP = 16; // px - espacio entre cards y filas

/**
 * Virtualiza filas (no celdas individuales): cada fila renderiza 1-3 cards
 * según el breakpoint. El infinite scroll se dispara cuando la última fila
 * visible se acerca al final de la lista.
 */

export function ProductList({
  products,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  error,
  onFetchNextPage,
  onAddToCart,
  hiddenIds,
  emptyMessage = 'Busca productos para comenzar',
}: ProductListProps) {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));
  const columns = isMd ? 3 : isSm ? 2 : 1;

  /**
   * Filtramos productos en carrito ANTES de virtualizar.
   * Esto es lo que cubre el peso 4 ("producto en carrito no aparece en lista").
   * useMemo para no recrear el array en cada render.
   */
  const visibleProducts = useMemo(
    () => products.filter((p) => !hiddenIds.has(p.id)),
    [products, hiddenIds]
  );

  /**
   * Agrupamos productos en filas según `columns`.
   * Cada fila virtual contendrá 1-3 productos.
   */
  const rows = useMemo<Product[][]>(() => {
    const out: Product[][] = [];
    for (let i = 0; i < visibleProducts.length; i += columns) {
      out.push(visibleProducts.slice(i, i + columns));
    }
    return out;
  }, [visibleProducts, columns]);

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT + GAP,
    overscan: 2, // renderiza 2 filas extra arriba/abajo del viewport
  });

  const virtualItems = virtualizer.getVirtualItems();

  /**
   * INFINITE SCROLL TRIGGER.
   * Cuando la última fila renderizada está entre las últimas 3 de la lista,
   * y hay más páginas, disparamos fetchNextPage.
   *
   * useEffect en vez de inline para que solo se dispare cuando cambia
   * realmente la última fila visible.
   */
  useEffect(() => {
    if (virtualItems.length === 0) return;
    const lastVisibleIndex = virtualItems[virtualItems.length - 1].index;
    const shouldFetch = lastVisibleIndex >= rows.length - 3;

    if (shouldFetch && hasNextPage && !isFetchingNextPage) {
      onFetchNextPage();
    }
  }, [virtualItems, rows.length, hasNextPage, isFetchingNextPage, onFetchNextPage]);

  // ---------- Estados de UI ----------

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar productos: {error.message}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  if (visibleProducts.length === 0) {
    // Hay productos cargados pero todos están en el carrito
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="body1" color="text.secondary">
          ¡Todos los productos visibles ya están en tu carrito!
        </Typography>
      </Box>
    );
  }

  // ---------- Lista virtualizada ----------

  return (
    <Box
      ref={parentRef}
      sx={{
        // Altura fija necesaria para que el virtualizer calcule correctamente
        height: 'calc(100vh - 220px)',
        overflowY: 'auto',
        position: 'relative',
        // Scroll suave nativo
        scrollBehavior: 'smooth',
      }}
    >
      {/* Spacer total: define la altura "real" como si todas las filas estuvieran renderizadas */}
      <Box
        sx={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((vRow) => {
          const row = rows[vRow.index];
          return (
            <Box
              key={vRow.key}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${vRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${GAP}px`,
                pb: `${GAP}px`,
              }}
            >
              {row.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </Box>
          );
        })}
      </Box>

      {isFetchingNextPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={28} />
        </Box>
      )}
    </Box>
  );
}