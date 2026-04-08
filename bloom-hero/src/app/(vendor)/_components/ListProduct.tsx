import Link from "next/link"
import { redirect } from "next/navigation"

import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card"
import { Button } from "@/components/ui/button"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"

type vendorType = 'market' | 'pop-up';

type ProductRow = {
  id: string
  product_name: string
  product_image_url: string | null
  price: number
  stocks: number
  categories: { category_name: string } | { category_name: string }[] | null
}

function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export default async function VendorListProductPage({ type }: { type: vendorType }) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .eq("vendor_type", type)
    .maybeSingle()

  if (vendorError || !vendor) {
    throw new Error(vendorError?.message || "Vendor profile not found.")
  }

  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("id, product_name, product_image_url, price, stocks, categories(category_name)")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false })

  if (productsError) {
    throw new Error(productsError.message)
  }

  const products: ProductRow[] = (productsData ?? []) as ProductRow[]

  return (
    // <main className="mx-auto max-w-6xl px-6 py-10">
    <main className = "flex-h screen">
      <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-start">
        <VendorDashboardSidebarCard activeTab="products" vendorType={type} />

        <div>
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Product List</h1>
              <p className="text-muted-foreground text-sm">
                Manage your product inventory and sales.
              </p>
            </div>

            <Button asChild>
              <Link href={`/vendor/${type}/add-product`}>Add Product</Link>
            </Button>
          </div>

          {products.length === 0 ? (
            <section className="rounded-lg border p-6 text-sm text-muted-foreground">
              No products yet. Add your first product to populate this list.
            </section>
          ) : (
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const isActive = product.stocks >= 1
                const categoryName = Array.isArray(product.categories)
                  ? product.categories[0]?.category_name
                  : product.categories?.category_name

                return (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-3xl border bg-white shadow-sm"
                  >
                    <div className="relative h-52 w-full bg-muted">
                      {product.product_image_url ? (
                        <img
                          src={product.product_image_url}
                          alt={product.product_name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}

                      <span
                        className={[
                          "absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs",
                          isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-orange-50 text-orange-600",
                        ].join(" ")}
                      >
                        {isActive ? "Active" : "Out of stock"}
                      </span>
                    </div>

                    <div className="space-y-1 px-4 pb-4 pt-3">
                      <h2 className="line-clamp-1 text-2xl font-medium text-foreground">
                        {product.product_name}
                      </h2>
                      <p className="line-clamp-1 text-sm text-muted-foreground">
                        {categoryName || "Uncategorized"}
                      </p>
                      <p className="text-2xl font-bold text-[#2f5d3a]">
                        {formatPeso(Number(product.price) || 0)}
                      </p>

                      <div className="pt-1">
                        <Button
                          type="button"
                          className="h-8 w-full rounded-lg bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                          Edit Product
                        </Button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
