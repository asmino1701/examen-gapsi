# e-Commerce Gapsi — Prueba técnica

Aplicación de búsqueda de productos con carrito drag & drop, construida con React 19, TypeScript y Vite. Consume el API REST de Axesso/Walmart vía RapidAPI.

---

## Tabla de contenidos

- [Stack](#-stack)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración (.env)](#-configuración-env)
- [Ejecución en desarrollo](#-ejecución-en-desarrollo)
- [Build de producción (minificado + ofuscado)](#-build-de-producción-minificado--ofuscado)
- [Patrones de diseño implementados](#-patrones-de-diseño-implementados)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Decisiones técnicas](#-decisiones-técnicas)
- [Funcionalidades cubiertas](#-funcionalidades-cubiertas)

---

## Stack

- **React 19** + **TypeScript 6** (strict)
- **Vite 8** (build tool, HMR)
- **Material-UI v6** (sistema de diseño)
- **TanStack Query** (estado del servidor, paginación, caché)
- **TanStack Virtual** (virtualización de listas)
- **Terser** + **javascript-obfuscator** (minificación + ofuscación)
- **Drag & Drop HTML5 nativo** (sin librerías externas)

---

## Requisitos previos

- **Node.js** ≥ 20.x ([descarga](https://nodejs.org/))
- **npm** ≥ 10.x (incluido con Node)
- **API key de RapidAPI** para el servicio [Axesso Walmart Data Service](https://rapidapi.com/axesso/api/axesso-walmart-data-service)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/asmino1701/examen-gapsi.git
cd examen-gapsi

# 2. Instalar dependencias
npm install
```

---

## Configuración (.env)

La aplicación lee credenciales del API desde variables de entorno. Crea un archivo `.env` en la raíz del proyecto (mismo nivel que `package.json`) con el siguiente contenido:

```env
VITE_RAPIDAPI_KEY=api_key_aqui
VITE_RAPIDAPI_HOST=axesso-walmart-data-service.p.rapidapi.com
VITE_API_BASE_URL=https://axesso-walmart-data-service.p.rapidapi.com
```

> Puedes usar `.env.example` como plantilla:
> ```bash
> cp .env.example .env
> ```
> Luego edita `.env` y reemplaza `tu_api_key_aqui` con tu llave real.

>  **Importante:** el archivo `.env` está en `.gitignore` y nunca debe subirse al repositorio.

---

## Ejecución en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador.

**Términos de búsqueda recomendados** (el API responde en inglés):
- `nintendo`
- `sony`
- `computer`
- `headphones`

---

## Build de producción (minificado + ofuscado)

```bash
npm run build
```

Genera la carpeta `dist/` con la aplicación lista para servir. Incluye:

1. **Minificación con Terser** (drop_console, drop_debugger).
2. **Ofuscación con javascript-obfuscator** vía hook de Rollup (`vite.config.ts`). Cada chunk JS pasa por:
   - Renombrado de identificadores (hexadecimal)
   - String array con codificación base64
   - Compactación

Para servir el build localmente:

```bash
npm run preview
```

Abre [http://localhost:4173](http://localhost:4173).

---

## Patrones de diseño implementados

Se implementaron **dos patrones GoF (Structural)**, documentados explícitamente en sus archivos con comentarios de cabecera:

### 1. Adapter — `src/services/walmartAdapter.ts`

Convierte la respuesta cruda del API de Axesso/Walmart (estructura externa que no controlamos) al modelo de dominio interno `Product`. El resto de la aplicación nunca ve la estructura del API externo.

**Beneficio:** si el proveedor cambia o el contrato del API se modifica, solo se toca este archivo.

### 2. Facade — `src/hooks/useCart.ts`

Expone una API simple (`addToCart`, `removeFromCart`, `resetCart`, `isInCart`) que oculta la complejidad interna del subsistema (`useContext` + `useReducer` + `Map<string, Product>`). Los componentes consumidores no saben que existe un reducer ni un context por debajo.

**Beneficio:** la lógica del carrito puede refactorizarse internamente sin tocar ningún componente.

---

## Estructura del proyecto
```
examen-gapsi/
├── public/
│   └── gapsi-logo.svg              # Logo de la marca
├── src/
│   ├── config/
│   │   └── api.config.ts           # Config del API (archivo separado)
│   ├── types/
│   │   └── product.ts              # Modelo de dominio Product
│   ├── services/
│   │   ├── httpClient.ts           # Cliente HTTP fino sobre fetch
│   │   └── walmartAdapter.ts       # PATRÓN ADAPTER
│   ├── hooks/
│   │   ├── useProductSearch.ts     # useInfiniteQuery + dedup por id
│   │   ├── useDebounce.ts          # Debounce genérico
│   │   └── useCart.ts              # PATRÓN FACADE
│   ├── context/
│   │   └── CartContext.tsx         # Provider + reducer puro
│   ├── components/
│   │   ├── SearchBar.tsx           # Input controlado + debounce
│   │   ├── ProductCard.tsx         # Card draggable (HTML5 DnD)
│   │   ├── ProductList.tsx         # Virtual scroll + infinite scroll
│   │   └── Cart.tsx                # Drop zone + lista de carrito
│   ├── theme.ts                    # Tema MUI (archivo separado)
│   ├── App.tsx                     # Orquestación
│   └── main.tsx                    # Entry + providers globales
├── .env.example                    # Plantilla de variables de entorno
├── .gitignore
├── vite.config.ts                  # Config Vite + plugin de ofuscación
├── tsconfig.json
└── README.md
```
---

## Decisiones técnicas

### Virtual scroll + infinite scroll combinados

Usamos `@tanstack/react-virtual` para virtualizar **filas** (no celdas individuales). Cada fila contiene 1-3 cards según el viewport. Para 1000 productos cargados, el DOM solo contiene ~12 nodos.

El infinite scroll se derivó del estado del virtualizer: cuando la última fila visible se acerca al final de la lista, se dispara `fetchNextPage`. Más confiable que un IntersectionObserver en un sentinel separado.

### Drag & drop HTML5 nativo (sin librerías)

- Custom MIME type `application/x-product-id` evita capturar drops de otros elementos del DOM.
- Contador `useRef` para `dragenter`/`dragleave` evita el parpadeo del highlight cuando el cursor cruza elementos hijos del drop zone.
- Botón "+" en cada card como fallback no-drag (accesibilidad + touch devices).

### Estado del carrito con `Map<string, Product>`

Lookup O(1) para `isInCart(id)`, consultado en cada producto en cada render. Con array sería O(n²). Combinado con `React.memo` en `ProductCard` y `useCallback` en handlers, los re-renders son mínimos.

### Deduplicación de productos entre páginas

El API de Walmart a veces devuelve el mismo producto en páginas distintas (sponsored, ranking). El hook `useProductSearch` deduplica por id antes de pasarlo a la lista.

### React Query con `staleTime: 5min`

Cambiar de "nintendo" a "sony" y volver a "nintendo" sirve resultados desde caché sin pegarle al API. Ahorra cuota de RapidAPI durante exploración.

---

## Funcionalidades cubiertas

### Requisitos funcionales

- [x] Header "e-Commerce Gapsi" con logo (peso 3)
- [x] Página de búsqueda con listado de productos (peso 5)
- [x] Nombre, precio e imagen de cada producto (peso 5)
- [x] Infinite scroll al hacer scroll vertical (peso 5)
- [x] Agregar productos al carrito arrastrándolos (peso 5 deseable)
- [x] Producto en carrito no aparece en la lista (peso 4 deseable)
- [x] Botón reiniciar arriba derecha (peso 3 deseable)

### Requisitos no funcionales

- [x] Virtual scroll (peso 5)
- [x] 2 patrones de diseño documentados (peso 4) → ver sección [Patrones](#-patrones-de-diseño-implementados)
- [x] Consumo del servicio REST (peso 5)
- [x] Build minificado y ofuscado (peso 3) → `npm run build`
- [x] Drag & drop al carrito (peso 5 deseable)
- [x] Material-UI (peso 4 deseable)
- [x] Repositorio público en GitHub (peso 5)

### Buenas prácticas

- [x] Comentarios en código (especialmente en patrones de diseño)
- [x] Archivos de configuración separados (`theme.ts`, `api.config.ts`, `vite.config.ts`)
- [x] TypeScript strict mode
- [x] Tipos explícitos en interfaces públicas
- [x] Memoización selectiva para evitar re-renders innecesarios

---

## Notas

- La API key se inyecta en el bundle del cliente (limitación inherente a aplicaciones SPA sin BFF). En producción real, este endpoint debería pasar por un proxy del lado del servidor.
- El servicio de Axesso responde en inglés. Recomendamos buscar con términos en inglés o marcas comerciales (`nintendo`, `sony`, etc.).



---

**Autor:** Andrés Miño · [LinkedIn](https://www.linkedin.com/in/andr%C3%A9s-mi%C3%B1o-27319814a/) · [GitHub](https://github.com/asmino1701)