import Link from "next/link"

import { VendorDashboardSidebarCard } from "@/components/vendor-dashboard-sidebar-card"
import { Button } from "@/components/ui/button"

const tempProducts = [
  {
    id: "p-001",
    name: "Rose",
    price: "₱39.99",
    stock: 12,
    status: "Active",
  },
  {
    id: "p-002",
    name: "Sunflower",
    price: "₱24.50",
    stock: 5,
    status: "Low Stock",
  },
  {
    id: "p-003",
    name: "Lilies",
    price: "₱15.00",
    stock: 0,
    status: "Out of Stock",
  },
]

export default function VendorListProductPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-start">
        <VendorDashboardSidebarCard activeTab="products" />

        <div>
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Product List</h1>
              <p className="text-muted-foreground text-sm">
                Manage your product inventory and sales.
              </p>
            </div>

            <Button asChild>
              <Link href="/vendor/market/add-product">Add Product</Link>
            </Button>
          </div>

          <section className="overflow-hidden rounded-lg border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tempProducts.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{product.price}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">{product.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </main>
  )
}
