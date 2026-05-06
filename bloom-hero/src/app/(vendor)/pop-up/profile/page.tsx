import { redirect } from "next/navigation"
import ProductCardImageCarousel from "@/components/ProductCardImageCarousel"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"
import { Icon } from "@iconify/react/dist/iconify.js"
import { mockUpcomingEvents } from "@/lib/mockData"
import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card"

type ProductRow = {
  id: string
  product_name: string
  product_image_url: string | null
  product_images?: { image_url: string; display_order: number }[] | null
  description: string | null
  price: number
}

const mockTags = ["Pop-up", "Romantic", "Budget-friendly"]

const mockReviews = [
  { id: "1", name: "Sara Duterte", comment: "Absolutely gorgeous arrangements! My go-to florist for any occasion.", rating: 5, daysAgo: 3 },
  { id: "2", name: "Bongbong Marcos", comment: "Fresh blooms and very thoughtful wrapping. Will definitely order again.", rating: 5, daysAgo: 3 },
  { id: "3", name: "Leni Robredo", comment: "Beautiful bouquet quality and fast turnaround. Highly recommended shop.", rating: 5, daysAgo: 5 },
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
  const trimmed = shopName?.trim()
  return trimmed?.length > 0 ? trimmed[0].toUpperCase() : "?"
}

export default async function Page() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id, shop_name")
    .eq("owner_id", user.id)
    .eq("vendor_type", "pop-up")
    .maybeSingle()

  if (vendorError || !vendor) throw new Error(vendorError?.message || "Pop-up vendor profile not found.")

  let productsData: ProductRow[] | null = null
  let productsError: any = null

  const { data, error } = await supabase
    .from("products")
    .select("id, product_name, product_image_url, description, price, product_images(image_url, display_order)")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false })

  productsData = data as ProductRow[] | null
  productsError = error

  if (productsError && /product_images|relationship|schema cache|does not exist/i.test(productsError.message)) {
    const fallback = await supabase
      .from("products")
      .select("id, product_name, product_image_url, description, price")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })
    productsData = fallback.data as ProductRow[] | null
    productsError = fallback.error
  }

  if (productsError) throw new Error(productsError.message)

  const products: ProductRow[] = (productsData ?? []) as ProductRow[]
  const shopInitial = getShopInitial(vendor.shop_name)

  return (
    <main className="flex h-screen bg-[#fbf7f4]" style={{ fontFamily: "'Quicksand', sans-serif" }}>

      {/* Sidebar */}
      <VendorDashboardSidebarCard activeTab="profile" vendorType="pop-up" />

      {/* Content */}
      <section className="flex-1 overflow-y-auto">
        <div className="w-full px-4 py-6 sm:px-8 lg:px-10 lg:py-8">

          {/* ── Profile header card ── */}
          <div className="rounded-3xl border border-[#ebe5de] bg-[#fbf9f6] px-5 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-6 sm:py-7 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Shop initial avatar */}
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#d9e7da] text-3xl font-bold text-[#2f5d3a] sm:h-24 sm:w-24 sm:text-4xl">
                  {shopInitial}
                </div>

                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-[#2c2825] sm:text-[26px]">
                    {vendor.shop_name}
                  </h1>

                  {/* Tags */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mockTags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full border border-[#d6d0c8] bg-white text-[#3a3633] text-[12px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Quick stats */}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#8a847d] sm:text-[13px]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2f5d3a]" />
                      <span>Open for orders</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f5ad2e]" />
                      <span>5.0 average rating</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Icon icon="mdi:map-marker-outline" width={13} height={13} color="#7a7a7a" />
                      <span>Cebu City</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#e0d8cf] px-4 text-xs font-medium text-[#4a453f] hover:bg-[#f3eee8]"
                >
                  Preview as customer
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[#2f5d3a] px-4 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(25,118,72,0.28)] hover:bg-[#254a2f]"
                >
                  Edit profile
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 border-t border-[#ece4dc] pt-3">
              <nav className="flex flex-wrap gap-4 text-sm text-[#8b847c]">
                {["Schedule", "Gallery", "Reviews", "About"].map((tab) => (
                  <a
                    key={tab}
                    href={`#${tab.toLowerCase()}`}
                    className={`border-b-2 pb-1 transition-colors hover:border-[#d2cbc3] hover:text-[#4a453f] ${
                      tab === "Schedule"
                        ? "border-[#2f5d3a] font-medium text-[#2f5d3a]"
                        : "border-transparent"
                    }`}
                  >
                    {tab}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* ── Schedule ── */}
          <section id="schedule" className="mt-10 scroll-mt-20">
            <div className="flex items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#262321]">Schedule</h2>
                <p className="mt-1 text-sm text-[#8d867d]">Where and when these blooms appear.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {mockUpcomingEvents.map((event, idx) => (
                <div key={idx} className="flex gap-4 items-stretch group">
                  {/* Date block */}
                  <div className="flex flex-col items-center justify-center min-w-[60px] bg-white border border-[#e8e3dc] rounded-2xl shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] group-hover:border-[#d24b46] transition-all duration-200">
                    <span className="text-[10px] font-bold text-[#d24b46] tracking-widest uppercase">{event.date.month}</span>
                    <span className="text-[24px] font-black text-[#1f1f1f] leading-none">{event.date.day}</span>
                  </div>

                  {/* Event card */}
                  <div className="flex-1 bg-white border border-[#e8e3dc] rounded-2xl px-4 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] group-hover:border-[#c5bfb7] transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[13px] font-bold text-[#1f1f1f] tracking-wide uppercase">{event.title}</p>
                      <span className="text-[11px] font-semibold text-white bg-[#2f5d3a] px-2.5 py-0.5 rounded-full">
                        {event.time}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Icon icon="mdi:map-marker-outline" width={13} height={13} color="#d24b46" className="mt-0.5 shrink-0" />
                      <p className="text-[12px] text-[#6f6a65] leading-relaxed">{event.location}</p>
                    </div>
                    <div className="flex items-start gap-1.5 mt-1">
                      <Icon icon="mdi:clock-outline" width={13} height={13} color="#8b847c" className="mt-0.5 shrink-0" />
                      <p className="text-[12px] text-[#8b847c] leading-relaxed">Open {event.time}, or until stocks last.</p>
                    </div>
                    <div className="mt-2.5">
                      <span className="text-[11px] font-semibold text-[#2f5d3a] bg-[#eef4f0] border border-[#cce0d4] px-2 py-0.5 rounded-full">
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Request a Pop-up ── */}
          <section className="mt-10 scroll-mt-20">
            <div className="rounded-3xl border border-[#ebe5de] bg-[#fbf9f6] px-5 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">

                {/* Left: description */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#eef4f0] border border-[#cce0d4] flex items-center justify-center">
                      <Icon icon="mdi:map-marker-plus-outline" width={16} height={16} color="#2f5d3a" />
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight text-[#262321]">Request a Pop-up</h2>
                  </div>
                  <p className="text-sm text-[#8d867d] max-w-sm">
                    Want to see this vendor near you? Submit a location request and we'll try to make it happen.
                  </p>
                </div>

                {/* Right: form */}
                <div className="flex-1 max-w-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "City / Municipality", type: "text", icon: "mdi:city-variant-outline" },
                      { label: "Barangay", type: "text", icon: "mdi:home-group" },
                      { label: "Landmark", type: "text", icon: "mdi:flag-outline" },
                      { label: "Preferred Date", type: "date", icon: "mdi:calendar-outline" },
                    ].map(({ label, type, icon }) => (
                      <div key={label}>
                        <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#4c4742] mb-1.5">
                          <Icon icon={icon} width={12} height={12} color="#8b847c" />
                          {label}
                        </label>
                        <input
                          type={type}
                          className="w-full border border-[#d6d0c8] rounded-xl px-3 py-2 text-[13px] bg-[#faf8f5] text-[#1f1f1f] focus:outline-none focus:border-[#2f5d3a] focus:bg-white transition-all placeholder:text-[#c5bfb7]"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-4 w-full bg-[#d24b46] hover:bg-[#b83d39] active:scale-[0.98] text-white font-bold text-[12px] tracking-widest uppercase py-3 rounded-full transition-all shadow-[0_4px_12px_rgba(210,75,70,0.3)]"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── Gallery ── */}
          <section id="gallery" className="mt-10 scroll-mt-20">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#262321]">Gallery</h2>
                <p className="mt-1 text-sm text-[#8d867d]">Handcrafted, ready-to-go bouquets for any occasion.</p>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-[#d8d0c7] bg-[#fbf8f4] px-5 py-7 text-sm text-[#7a746e]">
                <p className="font-medium text-[#4a453f]">No bouquets published yet.</p>
                <p className="mt-1">Start by adding a product to showcase your signature arrangements here.</p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                  const imageUrls = (product.product_images ?? [])
                    .slice()
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((img) => img.image_url)
                    .filter((url) => typeof url === "string" && url.trim().length > 0)
                  const primaryImageUrl = imageUrls[0] ?? product.product_image_url

                  return (
                    <article
                      key={product.id}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ece5dd] bg-[#fbf9f6] shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-[#e8dfd5] sm:h-48">
                        {primaryImageUrl ? (
                          <ProductCardImageCarousel
                            imageUrls={imageUrls.length > 0 ? imageUrls : [primaryImageUrl]}
                            productName={product.product_name}
                            imageClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[#998f84]">
                            {shopInitial}
                          </div>
                        )}
                        <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#2f5d3a] shadow-[0_6px_16px_rgba(15,23,42,0.18)] backdrop-blur-sm">
                          {formatPeso(Number(product.price) || 0)}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                        <h3 className="line-clamp-1 text-sm font-semibold text-[#2a2724]">{product.product_name}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-[#80786f]">
                          {product.description?.trim() || "Freshly arranged bouquet made with seasonal blooms."}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-[#9a9289]">
                          <span>Made to order</span>
                          <span>1–2 day lead time</span>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* ── Reviews ── */}
          <section id="reviews" className="mt-14 scroll-mt-20">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#262321]">Reviews</h2>
                <p className="mt-1 text-sm text-[#8d867d]">What customers are saying about this shop.</p>
              </div>
              <span className="hidden text-xs text-[#8b847c] sm:inline">
                Showing {mockReviews.length} recent reviews
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {mockReviews.map((review) => (
                <article
                  key={review.id}
                  className="flex h-full flex-col rounded-2xl border border-[#ece5dd] bg-[#fbf9f6] px-5 py-5 shadow-[0_6px_20px_rgba(15,23,42,0.05)]"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e7da] text-xs font-semibold text-[#2f5d3a]">
                      {review.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#2a2724]">{review.name}</h3>
                      <p className="text-[11px] text-[#9a9289]">{review.daysAgo} days ago</p>
                    </div>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-[#4c4742]">{review.comment}</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-[#f5ad2e]">
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </span>
                    <button type="button" className="text-[#8b847c] underline-offset-2 hover:underline">
                      View details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ── About ── */}
          <section id="about" className="mt-14 mb-16 scroll-mt-20">
            <h2 className="text-lg font-semibold tracking-tight text-[#262321]">About this shop</h2>
            <div className="mt-4 rounded-2xl border border-[#ece5dd] bg-[#fbf9f6] px-6 py-5">
              <p className="text-[15px] leading-7 text-[#4c4742]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et odio eros. Vivamus vitae
                elementum justo. Mauris volutpat suscipit ante, in hendrerit mauris tincidunt vitae. Pellentesque
                habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
              </p>
            </div>
          </section>

        </div>
      </section>
    </main>
  )
}