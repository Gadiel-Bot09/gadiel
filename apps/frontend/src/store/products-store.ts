import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  price: number;
  taxable: boolean;
  sku?: string;
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  loading: false,
  error: null,
  setProducts: (products) => set({ products }),
  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
  updateProduct: (product) =>
    set((state) => ({
      products: state.products.map((item) => (item.id === product.id ? product : item)),
    })),
  removeProduct: (id) => set((state) => ({ products: state.products.filter((item) => item.id !== id) })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
