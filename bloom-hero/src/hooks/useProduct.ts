import { useEffect, useState } from "react";
import { mockProducts } from "@/lib/mockData";
import { Product } from "@/typess";

export function useProduct(id: string) {
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const product = mockProducts.find((p) => p.id === id) || null;
      setData(product);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  return { data, loading };
}
