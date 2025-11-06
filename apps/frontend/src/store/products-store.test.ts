import { act } from 'react-dom/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import { useProductsStore } from './products-store';

afterEach(() => {
  useProductsStore.setState({ products: [], loading: false, error: null });
});

describe('useProductsStore', () => {
  it('adds, updates y elimina productos correctamente', () => {
    const { addProduct, updateProduct, removeProduct, getState } = useProductsStore.getState();

    act(() => {
      addProduct({ id: '1', name: 'Producto Demo', price: 1000, taxable: true });
    });
    expect(getState().products).toHaveLength(1);

    act(() => {
      updateProduct({ id: '1', name: 'Producto Actualizado', price: 1250, taxable: false });
    });
    expect(getState().products[0].name).toBe('Producto Actualizado');

    act(() => {
      removeProduct('1');
    });
    expect(getState().products).toHaveLength(0);
  });
});
