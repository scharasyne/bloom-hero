import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function VendorAddProductPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Add Product</h1>
          <p className="text-muted-foreground text-sm">
            Temporary form for adding a product.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/vendor/market/list-product">Back to Product List</Link>
        </Button>
      </div>

      <section className="space-y-4 rounded-lg border p-5">
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input id="product-name" placeholder="e.g., Classic White Bouquet" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" placeholder="0.00" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" type="number" placeholder="0" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Short description of the product"
            rows={5}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="button">Save Product</Button>
          <Button type="button" variant="secondary">
            Save as Draft
          </Button>
        </div>
      </section>
    </main>
  )
}
