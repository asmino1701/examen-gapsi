import { TextField, InputAdornment, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface SearchBarProps {
  /** Callback llamado cuando el keyword debounced cambia */
  onSearch: (keyword: string) => void;
  /** Placeholder del input */
  placeholder?: string;
}

/**
 * Barra de búsqueda con debounce.
 *
 * El componente mantiene su propio estado del input (controlled) y notifica
 * al padre solo cuando el usuario deja de escribir por ~400ms. Esto desacopla:
 * - El input se siente instantáneo (responde a cada tecla)
 * - El padre (y la API) solo reaccionan al valor "estable"
 */
export function SearchBar({ onSearch, placeholder = 'Buscar productos...' }: SearchBarProps) {
  const [value, setValue] = useState('');
  const debounced = useDebounce(value, 400);

  // Cuando el valor debounced cambia, notificamos al padre.
  useEffect(() => {
    onSearch(debounced);
    // onSearch viene del padre; asumimos que es estable (useCallback).
    // Si no lo fuera, igual el efecto se dispararía pero el padre
    // ya está protegido por queryKey de React Query.
  }, [debounced, onSearch]);

  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          '& .MuiOutlinedInput-root': {
            transition: 'box-shadow 0.2s ease',
            '&.Mui-focused': {
              boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
            },
          },
        }}
      />
    </Box>
  );
}