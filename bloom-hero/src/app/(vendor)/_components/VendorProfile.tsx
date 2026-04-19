import { redirect } from "next/navigation"

import ProductCardImageCarousel from "@/components/ProductCardImageCarousel"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"

type vendorType = 'market' | 'pop-up';

type ProductRow = {
  id: string
  product_name: string
  product_image_url: string | null
  product_images?: { image_url: string; display_order: number }[] | null
  description: string | null
  price: number
}

const mockReviews = [
  {
    id: "1",
    name: "Sara Duterte",
    comment: "Absolutely gorgeous arrangements! My go-to florist for any occasion.",
    rating: 5,
    daysAgo: 3,
  },
  {
    id: "2",
    name: "Bongbong Marcos",
    comment: "Fresh blooms and very thoughtful wrapping. Will definitely order again.",
    rating: 5,
    daysAgo: 3,
  },
  {
    id: "3",
    name: "Leni Robredo",
    comment: "Beautiful bouquet quality and fast turnaround. Highly recommended shop.",
    rating: 5,
    daysAgo: 5,
  },
]

function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

function getShopInitial(shopName: string) {
  if(!shopName) return "?"
  const trimmed = shopName.trim()
  return trimmed.length > 0 ? trimmed[0].toUpperCase() : "?"
}

export default async function VendorProfilePage({ type }: { type: vendorType }) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id, shop_name")
    .eq("owner_id", user.id)
    .eq("vendor_type", type)
    .maybeSingle()

  if (vendorError || !vendor) {
    throw new Error(vendorError?.message || "Market vendor profile not found.")
  }

  let productsData: ProductRow[] | null = null
  let productsError: Error | null = null

  {
    const { data, error } = await supabase
      .from("products")
      .select("id, product_name, product_image_url, description, price, product_images(image_url, display_order)")
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
      .select("id, product_name, product_image_url, description, price")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })

    productsData = fallback.data as ProductRow[] | null
    productsError = fallback.error
  }

  if (productsError) {
    throw new Error(productsError.message)
  }

  const products: ProductRow[] = (productsData ?? []) as ProductRow[]
  const shopInitial = getShopInitial(vendor.shop_name)

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-12">
      <section className="px-4 py-6 sm:px-8">
        <div className="mt-7 flex flex-col items-center text-center">
          <div className="flex h-40 w-40 items-center justify-center rounded-full bg-[#d9e7da] text-6xl font-bold text-[#2f5d3a] sm:h-48 sm:w-48 sm:text-7xl">
            {shopInitial}
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#3a3633]">{vendor.shop_name}</h1>
        </div>

        <div className="mt-8 border-y border-[#ebe5de] py-3">
          <div className="flex items-center gap-6 text-base text-[#8b847c]">
            <a href="#bouquets" className="pb-2 transition-colors hover:text-[#2f5d3a]">
              Bouquets
            </a>
            <a href="#reviews" className="pb-2 transition-colors hover:text-[#2f5d3a]">
              Reviews
            </a>
            <a href="#about" className="pb-2 transition-colors hover:text-[#2f5d3a]">
              About
            </a>
          </div>
        </div>

        <section id="bouquets" className="mt-8 scroll-mt-8">
          <h2 className="text-4xl font-bold tracking-tight text-[#252220]">Bouquets</h2>
          <p className="mt-1 text-sm text-[#8d867d]">Handcrafted, ready-to-go bouquets for any occasion.</p>

          {products.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[#d8d0c7] px-5 py-7 text-sm text-[#7a746e]">
              No bouquets published yet.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-[#ece5dd] bg-[#faf8f5] shadow-[0_4px_18px_rgba(0,0,0,0.05)]"
                >
                  <div className="relative h-44 w-full bg-[#e8dfd5]">
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
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-[#998f84]">
                          {shopInitial}
                        </div>
                      )
                    })()}
                  </div>

                  <div className="space-y-2 px-4 pb-4 pt-3">
                    <h3 className="line-clamp-1 text-xl font-semibold text-[#2a2724]">{product.product_name}</h3>
                    <p className="text-lg font-semibold text-[#2a2724]">{formatPeso(Number(product.price) || 0)}</p>
                    <p className="line-clamp-2 text-sm text-[#80786f]">
                      {product.description?.trim() || "Freshly arranged bouquet made with seasonal blooms."}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="reviews" className="mt-14 scroll-mt-8">
          <h2 className="text-left text-4xl font-bold tracking-tight text-[#252220]">Reviews</h2>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {mockReviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-[#ece5dd] bg-[#faf8f5] px-6 py-5 shadow-[0_4px_18px_rgba(0,0,0,0.05)]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9e7da] text-sm font-bold text-[#2f5d3a]">
                    {review.name[0]}
                  </div>
                  <h3 className="text-base font-semibold text-[#2a2724]">{review.name}</h3>
                </div>

                <p className="min-h-14 text-sm text-[#4c4742]">{review.comment}</p>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[#f5ad2e]">{"★".repeat(review.rating)}</span>
                  <span className="text-[#8b847c]">{review.daysAgo} days ago</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="mt-14 scroll-mt-8">
          <h2 className="text-4xl font-bold tracking-tight text-[#252220]">About</h2>
          <div className="mt-4 rounded-2xl border border-[#ece5dd] bg-[#faf8f5] px-6 py-5">
            <p className="text-[15px] leading-7 text-[#4c4742]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et odio eros. Vivamus vitae
              elementum justo. Mauris volutpat suscipit ante, in hendrerit mauris tincidunt vitae. Pellentesque
              habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur sit amet
              nisl nec nulla posuere egestas. Integer facilisis, ipsum non luctus gravida, nisi urna pretium metus,
              ac malesuada nibh nibh vitae augue.
            </p>
          </div>
        </section>
      </section>
    </main>
  )
}
