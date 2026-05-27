import { apiConfig } from '../config/api.config';
import type { Product, ProductSearchPage } from '../types/product';
import { httpGet } from './httpClient';

/**
 * Patrón Adapter (GoF). Traduce la respuesta del API de Walmart/Axesso
 * al modelo `Product` que usa el resto de la app. Si cambia el proveedor
 * o el contrato del API, solo se modifica este archivo.
 */

interface RawWalmartItem {
  id: string;
  usItemId?: string;
  name: string;
  price?: number;
  priceInfo?: {
    linePrice?: string;
    linePriceDisplay?: string;
  };
  image?: string;
  imageInfo?: { thumbnailUrl?: string };
  canonicalUrl?: string;
}

interface RawWalmartResponse {
  responseStatus: string;
  keyword: string;
  item: {
    props: {
      pageProps: {
        initialData: {
          searchResult: {
            aggregatedCount?: number;
            itemStacks: Array<{
              count: number;
              items: RawWalmartItem[];
            }>;
            paginationV2?: {
              maxPage?: number;
            };
          };
        };
      };
    };
  };
}

function adaptItem(item: RawWalmartItem, idx: number): Product {
  const display = item.priceInfo?.linePrice ?? `$${item.price?.toFixed(2) ?? '0.00'}`;

  // El API puede omitir el id en algunos sponsored items; fallback determinístico.
  const rawId = item.usItemId || item.id || '';
  const id = rawId.length > 0 ? rawId : `idx-${idx}-${item.name ?? 'noname'}`;

  return {
    id,
    name: item.name ?? 'Producto sin nombre',
    price: display,
    priceValue: item.price ?? 0,
    imageUrl: item.imageInfo?.thumbnailUrl ?? item.image ?? '',
    productUrl: item.canonicalUrl
      ? `https://www.walmart.com${item.canonicalUrl}`
      : undefined,
  };
}

export async function searchProducts(
  keyword: string,
  page: number,
  signal?: AbortSignal
): Promise<ProductSearchPage> {
  const raw = await httpGet<RawWalmartResponse>(
    apiConfig.endpoints.walmartSearch,
    { keyword, page, sortBy: 'best_match' },
    { signal }
  );

  const searchResult = raw.item.props.pageProps.initialData.searchResult;
  const items = searchResult.itemStacks.flatMap((stack) => stack.items);
  const products = items.map((it, idx) => adaptItem(it, idx));

  const maxPage = searchResult.paginationV2?.maxPage ?? page;
  const hasNextPage = page < maxPage;

  return {
    products,
    page,
    hasNextPage,
    totalResults: searchResult.aggregatedCount,
  };
}