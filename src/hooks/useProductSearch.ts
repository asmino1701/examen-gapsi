import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { searchProducts } from '../services/walmartAdapter';
import type { Product, ProductSearchPage } from '../types/product';

export interface UseProductSearchResult {
  products: Product[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProductSearch(keyword: string): UseProductSearchResult {
  const trimmed = keyword.trim();
  const enabled = trimmed.length >= 2;

  const query = useInfiniteQuery<ProductSearchPage, Error>({
    queryKey: ['products', trimmed],
    queryFn: ({ pageParam, signal }) =>
      searchProducts(trimmed, pageParam as number, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled,
  });

  // Dedupe por id: el API repite items entre páginas (sponsored, ranking).
  const products = useMemo<Product[]>(() => {
    if (!query.data) return [];
    const seen = new Set<string>();
    const out: Product[] = [];
    for (const page of query.data.pages) {
      for (const p of page.products) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          out.push(p);
        }
      }
    }
    return out;
  }, [query.data]);

  return {
    products,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isLoading: query.isLoading && enabled,
    isFetchingNextPage: query.isFetchingNextPage,
    error: query.error,
    refetch: query.refetch,
  };
}