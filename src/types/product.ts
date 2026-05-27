export interface Product {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  imageUrl: string;
  productUrl?: string;
}

//Respuesta paginada normalizada que devuelve el servicio.
 
export interface ProductSearchPage {
  products: Product[];
  page: number;
  hasNextPage: boolean;
  totalResults?: number;
}