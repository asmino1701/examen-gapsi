import { useState, useRef, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Tooltip,
  Badge,
  Fade,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { Product } from '../types/product';

interface CartProps {
  items: Product[];
  onRemove: (id: string) => void;
  /** Llamado cuando se suelta un producto sobre el carrito */
  onDropProduct: (productId: string) => void;
}

/**
 * Drop zone del carrito + lista de items con botón de quitar.
 * Drag & drop nativo: requiere preventDefault en onDragOver para habilitar el drop.
 */

export function Cart({ items, onRemove, onDropProduct }: CartProps) {
  const [isDragOver, setIsDragOver] = useState(false);

    // Contador para distinguir entrada real al contenedor vs cruce de hijos
    // (evita parpadeo del highlight). Ref, no state, porque no debe re-renderizar.
  
  const dragCounter = useRef(0);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // CRÍTICO: sin preventDefault, el browser cancela el drop event.
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      dragCounter.current = 0;

      const productId = e.dataTransfer.getData('application/x-product-id');
      if (productId) {
        onDropProduct(productId);
      }
    },
    [onDropProduct]
  );

  return (
    <Paper
      elevation={isDragOver ? 8 : 2}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        p: 2,
        position: 'sticky',
        top: 80, // debajo del AppBar sticky
        // El borde punteado es el "tell" visual del drop zone:
        // dice "aquí se puede soltar algo".
        border: '2px dashed',
        borderColor: isDragOver ? 'primary.main' : 'divider',
        bgcolor: isDragOver ? 'primary.50' : 'background.paper',
        transition: 'all 0.2s ease',
        // Escala sutil al hover de drag → feedback adicional
        transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Cabecera con icono + badge de conteo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Badge
          badgeContent={items.length}
          color="success"
          showZero
          sx={{
            '& .MuiBadge-badge': {
              fontWeight: 700,
              fontSize: '0.85rem',
            },
          }}
        >
          <ShoppingCartIcon
            sx={{
              fontSize: 36,
              color: isDragOver ? 'primary.main' : 'text.secondary',
              transition: 'color 0.2s ease',
            }}
          />
        </Badge>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Mi Carrito
        </Typography>
      </Box>

      {/* Mensaje guía cuando está vacío o durante el drag */}
      {items.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          {/* Ícono Font Awesome cargado desde CDN (ver index.html) */}
          <Box
            component="i"
            className={isDragOver ? 'fa-solid fa-hand-pointer' : 'fa-solid fa-arrow-down'}
            sx={{
              fontSize: 32,
              color: 'text.secondary',
              display: 'block',
              mb: 1,
              animation: isDragOver ? 'none' : 'bounce 1.5s ease-in-out infinite',
              '@keyframes bounce': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(8px)' },
              },
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {isDragOver
              ? '¡Suelta aquí para agregar!'
              : 'Arrastra aquí tus productos'}
          </Typography>
        </Box>
      )}

      {/* Lista de items con animación de entrada */}
      {items.length > 0 && (
        <List dense disablePadding>
          {items.map((item) => (
            <Fade in key={item.id} timeout={300}>
              <ListItem
                disableGutters
                secondaryAction={
                  <Tooltip title="Quitar del carrito">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => onRemove(item.id)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': { color: 'error.main' },
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={item.imageUrl}
                    variant="rounded"
                    alt={item.name}
                    sx={{ bgcolor: '#fafafa' }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
                      {item.price}
                    </Typography>
                  }
                />
              </ListItem>
            </Fade>
          ))}
        </List>
      )}
    </Paper>
  );
}