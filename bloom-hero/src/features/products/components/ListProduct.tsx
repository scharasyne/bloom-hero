import Link from "next/link"
import { redirect } from "next/navigation"
import EditProductModalTrigger from "@/features/products/components/EditProductModalTrigger"
import { VendorPageShell } from "@/components/VendorPageShell"
import ProductCardImageCarousel from "@/components/ProductCardImageCarousel"
import { Button } from "@/components/ui/button"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"
import { getVendorCommonProfileByOwner } from "@/features/vendors/queries/getVendorCommonProfile"
import { VendorCatalogBlockedPanel } from "@/features/vendors/components/VendorCatalogBlockedPanel"
import { canManageCatalog } from "@/features/vendors/utils/catalogAccess"

type ProductRow = {
  id: string
  product_name: string
  description: string | null
  product_image_url: string | null
  product_images?: { id: string; image_url: string; display_order: number }[] | null
  price: number
  stocks: number
  product_categories?: { category: { category_name: string } | null }[] | null
}

function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export default async function VendorListProductPage() {
  const supabase = await createSupabaseServerClient()
  const commonProfile = await getVendorCommonProfileByOwner()
  if (!commonProfile) redirect("/login")
  if (!canManageCatalog(commonProfile.businessType)) {
    return (
      <VendorPageShell activeTab="products" businessType={commonProfile.businessType}>
        <div className="mb-8">
          <h1 className="page-title">Product List</h1>
          <p className="mt-0.5 text-sm text-slate-400">Manage your product inventory and sales.</p>
        </div>
        <VendorCatalogBlockedPanel
          title="Register your business!"
          description="Product listings and inventory unlock after you register your business with BloomHero."
        />
      </VendorPageShell>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const vendor = { id: commonProfile.vendorId }

  let productsData: ProductRow[] | null = null
  let productsError: Error | null = null

  {
    const { data, error } = await supabase
      .from("products")
      .select("id, product_name, description, product_image_url, price, stocks, product_categories(category:categories(category_name)), product_images(id, image_url, display_order)")
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
      .select("id, product_name, description, product_image_url, price, stocks, product_categories(category:categories(category_name))")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })

    productsData = fallback.data as ProductRow[] | null
    productsError = fallback.error
  }

  if (productsError) {
    throw new Error(productsError.message)
  }

  const products: ProductRow[] = (productsData ?? []) as ProductRow[]

  return (
    <VendorPageShell activeTab="products" businessType={commonProfile.businessType}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="page-title">Product List</h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Manage your product inventory and sales.
              </p>
            </div>

            <Button asChild className="btn-mobile rounded-xl bg-[#2f5d3a] px-5 text-sm font-semibold text-white shadow-none hover:bg-[#26492f] transition-colors">
              <Link href="/vendor/add-product">+ Add Product</Link>
            </Button>
          </div>

          {products.length === 0 ? (
            <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ddd8d2] bg-[#faf9f7] py-16 text-center">
              <p className="text-sm font-medium text-slate-400">No products yet</p>
              <p className="mt-1 text-xs text-slate-300">Add your first product to populate this list.</p>
            </section>
          ) : (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const isActive = product.stocks >= 1
                const categoryNames = (product.product_categories ?? [])
                  .map((relationship) => relationship.category?.category_name)
                  .filter((categoryName): categoryName is string => Boolean(categoryName))

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-2xl border border-[#ebe7e3] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(47,93,58,0.10)]"
                  >
                    <div className="relative h-52 w-full bg-[#f0ece8] overflow-hidden">
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
                          "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm",
                          isActive
                            ? "bg-white/80 text-emerald-700"
                            : "bg-white/80 text-orange-500",
                        ].join(" ")}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-orange-400"}`} />
                        {isActive ? "Active" : "Out of stock"}
                      </span>
                    </div>

                    <div className="px-4 pb-4 pt-3">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-300">
                        {categoryNames.length > 0 ? categoryNames.join(", ") : "Uncategorized"}
                      </p>
                      <h2 className="line-clamp-1 text-base font-semibold text-[#1e1c1a]">
                        {product.product_name}
                      </h2>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-lg font-bold tabular-nums text-[#2f5d3a]">
                          {formatPeso(Number(product.price) || 0)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {product.stocks} in stock
                        </p>
                      </div>
                      <div className="mt-3 border-t border-[#f0ece8] pt-3">
                        <EditProductModalTrigger product={product} />
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          )}
    </VendorPageShell>
  )
}
