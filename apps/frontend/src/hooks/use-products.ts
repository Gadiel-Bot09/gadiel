import { useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

import { useCompanyStore } from '../store/company-store';
import { Product, useProductsStore } from '../store/products-store';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export function useProducts() {
  const { currentCompanyId } = useCompanyStore();
  const { products, loading, error, setProducts, addProduct, updateProduct, removeProduct, setLoading, setError } =
    useProductsStore();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<Product[]>(`${API_URL}/products`, {
        headers: {
          'X-Company-Id': currentCompanyId,
        },
      });
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el listado de productos.');
      toast.error('No se pudo cargar el listado de productos');
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId, setError, setLoading, setProducts]);

  const createProduct = useCallback(
    async (payload: Omit<Product, 'id'>) => {
      try {
        setLoading(true);
        const response = await axios.post<Product>(`${API_URL}/products`, payload, {
          headers: { 'X-Company-Id': currentCompanyId },
        });
        addProduct(response.data);
        toast.success('Producto creado');
      } catch (err) {
        console.error(err);
        toast.error('No fue posible crear el producto');
      } finally {
        setLoading(false);
      }
    },
    [addProduct, currentCompanyId, setLoading],
  );

  const patchProduct = useCallback(
    async (id: string, payload: Partial<Omit<Product, 'id'>>) => {
      try {
        setLoading(true);
        const response = await axios.patch<Product>(`${API_URL}/products/${id}`, payload, {
          headers: { 'X-Company-Id': currentCompanyId },
        });
        updateProduct(response.data);
        toast.success('Producto actualizado');
      } catch (err) {
        console.error(err);
        toast.error('No fue posible actualizar el producto');
      } finally {
        setLoading(false);
      }
    },
    [currentCompanyId, setLoading, updateProduct],
  );

  const deleteProduct = useCallback(
    async (id: string, confirmation: string) => {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/products/${id}`, {
          headers: { 'X-Company-Id': currentCompanyId },
          data: { confirmation },
        });
        removeProduct(id);
        toast.success('Producto eliminado');
      } catch (err) {
        console.error(err);
        toast.error('No fue posible eliminar el producto');
      } finally {
        setLoading(false);
      }
    },
    [currentCompanyId, removeProduct, setLoading],
  );

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, fetchProducts, createProduct, patchProduct, deleteProduct };
}
