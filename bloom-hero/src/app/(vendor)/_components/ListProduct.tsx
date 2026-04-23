import Link from "next/link"
import { redirect } from "next/navigation"

import EditProductModalTrigger from "@/app/(vendor)/_components/EditProductModalTrigger"
import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card"
import ProductCardImageCarousel from "@/components/ProductCardImageCarousel"
import { Button } from "@/components/ui/button"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"

type vendorType = 'market' | 'pop-up';

type ProductRow = {
  id: string
  product_name: string
  description: string | null
  product_image_url: string | null
  product_images?: { id: string; image_url: string; display_order: number }[] | null
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

  let productsData: ProductRow[] | null = null
  let productsError: Error | null = null

  {
    const { data, error } = await supabase
      .from("products")
      .select("id, product_name, description, product_image_url, price, stocks, categories!products_category_id_fkey(category_name), product_images(id, image_url, display_order)")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })

    productsData = data as ProductRow[] | null
    productsError = error
  }

  if (
    productsError &&
    /product_images|relationship|schema cache|does not exist/i.test(productsError.message)
  ) {
    const fallback = await supabase
      .from("products")
      .select("id, product_name, description, product_image_url, price, stocks, categories!products_category_id_fkey(category_name)")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })

    productsData = fallback.data as ProductRow[] | null
    productsError = fallback.error
  }

  if (productsError) {
    throw new Error(productsError.message)
  }

  const products: ProductRow[] = (productsData ?? []) as ProductRow[]

  {/*
    
    // <main className="mx-auto max-w-6xl px-6 py-10">
    {/* // <main className = "flex-h screen"> */}
    {/* // <main className= "flex flex-wrap min-h-screen"> */}
    {/* // <main> */}
  return (
    <main className = "flex">
      <div className="lg:p-6">
        <VendorDashboardSidebarCard activeTab="products" vendorType="pop-up" />
      </div>
      <div className = "w-full p-4 lg:pl-2 lg:pr-10 md:p-6 sm:pt-20">
        <div>
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Product List</h1>
              <p className="text-muted-foreground text-sm">
                Manage your product inventory and sales.
              </p>
            </div>

            <Button asChild className="bg-[#2f5d3a] text-white">
              <Link href={`/${type}/add-product`}>Add Product</Link>
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
                      {(() => {
                        const imageUrls = (product.product_images ?? [])
                          .slice()
                          .sort((a, b) => a.display_order - b.display_order)
                          .map((img) => img.image_url)
                          .filter((url) => typeof url === "string" && url.trim().length > 0)
                        const primaryImageUrl =
                          imageUrls[0] ?? product.product_image_url

                        return primaryImageUrl ? (
                          <>
                            <ProductCardImageCarousel
                              imageUrls={imageUrls.length > 0 ? imageUrls : [primaryImageUrl]}
                              productName={product.product_name}
                              imageClassName="h-full w-full object-cover"
                            />
                          </>
                        ) : null
                      })()}

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
                        <EditProductModalTrigger product={product} />
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
