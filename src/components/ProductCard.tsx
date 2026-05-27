import { Card, CardMedia, CardContent, Typography, Box, IconButton, Tooltip } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { memo } from 'react';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  /** Callback al agregar al carrito (fallback no-drag, accesibilidad) */
  onAddToCart: (product: Product) => void;
}

/**
 * Card draggable con HTML5 DnD nativo. El botón "+" es fallback para touch.
 * Memoizada porque se renderiza muchas veces dentro del virtual scroll.
 */

function ProductCardImpl({ product, onAddToCart }: ProductCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Custom MIME type: solo NUESTRO drop target reacciona a esto,
    // evitando interferencia con drag de texto/imágenes del browser.
    e.dataTransfer.setData('application/x-product-id', product.id);
    e.dataTransfer.effectAllowed = 'copy';

    // Imagen "ghost" del drag (opcional). El browser usa el elemento por defecto.
    // No la sobreescribimos para simplificar.
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'grab',
        position: 'relative',
        '&:active': { cursor: 'grabbing' },
      }}
    >
      {/* Indicador visual de "esto se puede arrastrar" */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          color: 'action.disabled',
          zIndex: 1,
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>

      {/* Botón "+" para agregar sin drag (accesibilidad + touch) */}
      <Tooltip title="Agregar al carrito">
        <IconButton
          size="small"
          onClick={() => onAddToCart(product)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'primary.main', color: 'white' },
          }}
        >
          <AddShoppingCartIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <CardMedia
        component="img"
        image={product.imageUrl}
        alt={product.name}
        sx={{
          height: 180,
          objectFit: 'contain',
          bgcolor: '#fafafa',
          p: 2,
        }}
        // Si la imagen falla, mostramos un placeholder en vez de un icono roto
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://via.placeholder.com/200x200?text=No+Image';
        }}
      />

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.5em',
          }}
        >
          {product.name}
        </Typography>
        <Typography
          variant="h6"
          color="primary"
          sx={{ mt: 'auto', fontWeight: 700 }}
        >
          {product.price}
        </Typography>
      </CardContent>
    </Card>
  );
}

export const ProductCard = memo(ProductCardImpl);