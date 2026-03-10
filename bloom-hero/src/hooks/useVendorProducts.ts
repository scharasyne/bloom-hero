import { useState } from "react";

export interface VendorProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  stock: number;
  imageUrl?: string;
  visible: boolean;
}

export function useVendorProducts(vendorId: string) {
  const [products, setProducts] = useState<VendorProduct[]>([]);

  const addProduct = (product: VendorProduct) => {
    setProducts((prev) => [...prev, product]);
  };

  const editProduct = (id: string, updated: Partial<VendorProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const archiveProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return { data: products, addProduct, editProduct, archiveProduct };
}
