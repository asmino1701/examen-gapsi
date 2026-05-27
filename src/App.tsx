import { useState, useCallback, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Button,
  Tooltip,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { SearchBar } from './components/SearchBar';
import { ProductList } from './components/ProductList';
import { Cart } from './components/Cart';
import { useProductSearch } from './hooks/useProductSearch';
import { useCart } from './hooks/useCart';
import type { Product } from './types/product';

function App() {
  const [keyword, setKeyword] = useState('');

  const {
    products,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
  } = useProductSearch(keyword);

  const { items, count, addToCart, removeFromCart, resetCart, isInCart } =
    useCart();

 // Ids ocultos en la lista (los que están en el carrito).
  const hiddenIds = useMemo(
    () => new Set(items.map((it) => it.id)),
    [items]
  );

 
  const handleDropProduct = useCallback(
    (productId: string) => {
      // Si por alguna razón ya está en el carrito, no hacemos nada.
      if (isInCart(productId)) return;

      const product = products.find((p) => p.id === productId);
      if (product) {
        addToCart(product);
      }
    },
    [products, isInCart, addToCart]
  );


  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product);
    },
    [addToCart]
  );

  const handleReset = useCallback(() => {
    resetCart();
    setKeyword('');
  }, [resetCart]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <Box
            component="img"
            src="/logoBlanco.png"
            alt="Gapsi"
            sx={{ height: 40, mr: 2 }}
          />
          <Typography
            variant="h6"
            component="h1"
            sx={{ flexGrow: 1, fontWeight: 700 }}
          >
            e-Commerce Gapsi
          </Typography>
          <Tooltip title="Reiniciar aplicación">
            <span>
              <Button
                color="inherit"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                disabled={count === 0 && keyword === ''}
                sx={{
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                }}
              >
                Reiniciar
              </Button>
            </span>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <SearchBar onSearch={setKeyword} />

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          }}
        >
          <ProductList
            products={products}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            error={error}
            onFetchNextPage={fetchNextPage}
            onAddToCart={handleAddToCart}
            hiddenIds={hiddenIds}
            emptyMessage={
              keyword
                ? 'No se encontraron productos para tu búsqueda'
                : 'Escribe en el buscador para encontrar productos'
            }
          />
          <Cart
            items={items}
            onRemove={removeFromCart}
            onDropProduct={handleDropProduct}
          />
        </Box>
      </Container>
    </Box>
  );
}

export default App;