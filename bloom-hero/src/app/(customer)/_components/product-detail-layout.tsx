"use client";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { mockBouquets } from "@/lib/mockData";

function MainPicture({ src }: { src: string }) {
  return (
    <div className="shrink-0 overflow-hidden rounded-[24px] size-[420px] bg-[#f4f0eb]">
      <img
        alt="Product"
        className="size-full object-cover pointer-events-none"
        src={src}
      />
    </div>
  );
}

function ChevronButton({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Previous image" : "Next image"}
      className="flex items-center justify-center text-[#5f5f5f] transition hover:text-[#D24B46] shrink-0"
    >
      <span className="text-[40px] leading-none">{direction === "left" ? "‹" : "›"}</span>
    </button>
  );
}

function GalleryDots({ currentIndex, totalItems, onDotClick }: { currentIndex: number; totalItems: number; onDotClick: (index: number) => void }) {
  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      {Array.from({ length: totalItems }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`size-2.5 rounded-full transition ${
            index === currentIndex ? "bg-[#D24B46]" : "bg-[#d9d4cd] hover:bg-[#e6d4cf]"
          }`}
          aria-label={`Go to image ${index + 1}`}
        />
      ))}
    </div>
  );
}

function Thumbnail({ src, alt, active = false, onClick }: { src: string; alt: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 overflow-hidden rounded-[16px] size-[116px] border transition cursor-pointer ${
        active ? "border-[#D24B46] ring-2 ring-[#D24B46]/20" : "border-transparent hover:border-[#d9d4cd]"
      }`}
    >
      <img alt={alt} className="size-full object-cover pointer-events-none" src={src} />
    </button>
  );
}

function Gallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mockBouquets.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === mockBouquets.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="flex flex-col items-center w-[560px]">
      <MainPicture src={mockBouquets[currentIndex].image_url} />

      <div className="mt-4 flex items-center gap-3">
        <ChevronButton direction="left" onClick={handlePrevious} />

        <div className="flex gap-3 overflow-hidden">
          {mockBouquets.slice(0, 4).map((item, index) => (
            <Thumbnail
              key={item.id}
              src={item.image_url}
              alt={item.name}
              active={index === currentIndex}
              onClick={() => handleThumbnailClick(index)}
            />
          ))}
        </div>

        <ChevronButton direction="right" onClick={handleNext} />
      </div>

      <GalleryDots currentIndex={currentIndex} totalItems={mockBouquets.length} onDotClick={handleDotClick} />
    </div>
  );
}

function Headline() {
  return (
    <div className="flex flex-col gap-[12px]">
      <h1 className="text-[36px] font-semibold leading-tight text-[#1f1f1f]">
        Pink Peonies Bouquet
      </h1>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-[18px] font-semibold text-[#F4B400]">★</span>
          <span className="text-[18px] font-semibold text-[#1f1f1f]">4.9</span>
        </div>
        <span className="text-[16px] text-[#6b6b6b]">(67 reviews)</span>
      </div>
      <div className="flex items-center gap-1 text-[16px] text-[#6b6b6b]">
        <Icon icon="mdi:map-marker-outline" className="size-[20px] shrink-0" />
        <span>Bloom & Co. • 0.5 km</span>
      </div>
    </div>
  );
}

function Tags() {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full bg-[#f3eee8] px-3 py-1 text-[14px] text-[#4d4a46]">
        Fresh
      </span>
      <span className="rounded-full bg-[#f3eee8] px-3 py-1 text-[14px] text-[#4d4a46]">
        Handmade
      </span>
      <span className="rounded-full bg-[#f3eee8] px-3 py-1 text-[14px] text-[#4d4a46]">
        For delivery
      </span>
    </div>
  );
}

function PriceStock() {
  return (
    <div className="flex items-center gap-4">
      <strong className="text-[24px] font-semibold text-[#2f5d3a]">₱750</strong>
      <div className="bg-[#2f5d3a] flex gap-[6px] items-center px-[12px] py-[6px] rounded-[999px]">
        <Icon icon="mdi:check" className="size-[18px] text-white shrink-0" />
        <span className="font-medium text-[14px] text-white whitespace-nowrap">
          In Stock (24 available)
        </span>
      </div>
    </div>
  );
}

function Quantity() {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => setQuantity(quantity + 1);
  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-[16px] font-medium text-[#1f1f1f]">Quantity:</span>
      <div className="flex items-center rounded-full border border-[#edeae6] bg-white">
        <button
          onClick={handleDecrement}
          className="px-4 py-2 text-[18px] text-[#1f1f1f] hover:text-[#D24B46] transition"
        >
          −
        </button>
        <span className="min-w-10 px-3 text-center text-[16px] text-[#1f1f1f]">
          {quantity}
        </span>
        <button
          onClick={handleIncrement}
          className="px-4 py-2 text-[18px] text-[#1f1f1f] hover:text-[#D24B46] transition"
        >
          +
        </button>
      </div>
    </div>
  );
}

function AddToCartButton() {
  return (
    <button className="flex-1 rounded-full border-2 border-[#e6e1dc] px-5 py-3 text-[16px] font-semibold text-[#D24B46] transition hover:border-[#D24B46] hover:bg-[#fff5f3] flex items-center justify-center gap-2">
      <Icon icon="mdi:cart-outline" className="size-[20px]" />
      Add to cart
    </button>
  );
}

function BuyNow() {
  return (
    <button className="flex-1 rounded-full bg-[#D24B46] px-5 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#b03d33] flex items-center justify-center gap-2">
      <Icon icon="mdi:shopping-outline" className="size-[20px] text-white shrink-0" />
      Buy now
    </button>
  );
}

function Cta() {
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      <AddToCartButton />
      <BuyNow />
    </div>
  );
}

function Text() {
  return (
    <div className="flex max-w-[560px] flex-col gap-[32px]">
      <Headline />
      <Tags />
      <PriceStock />
      <p className="text-[16px] leading-7 text-[#3a3733]">
        A soft bouquet of pink peonies arranged for a graceful, romantic look.
        This is mock data for the product detail page; real listings will later
        use vendor-uploaded images and product information.
      </p>
      <Quantity />
      <Cta />
    </div>
  );
}

function ProductDetails() {
  return (
    <section className="w-full max-w-[1200px] px-[64px] pt-[64px] pb-[32px]">
      <div className="flex items-start gap-[48px]">
        <Gallery />
        <Text />
      </div>
    </section>
  );
}

type ReviewCardProps = {
  name: string;
  avatar?: string;
  review: string;
  date: string;
};

function Stars() {
  return (
    <p className="text-[14px] leading-none text-[#f4b740]">★★★★★</p>
  );
}

function ReviewCard({ name, avatar, review, date }: ReviewCardProps) {
  return (
    <div className="rounded-[24px] border border-[#edeae6] bg-[#f6f1ee] p-[24px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        {avatar ? (
          <img
            alt={name}
            className="size-[56px] rounded-full object-cover"
            src={avatar}
            width={56}
            height={56}
          />
        ) : (
          <div className="flex size-[56px] items-center justify-center rounded-full bg-[#edeae6] text-[16px] font-semibold text-[#5f5f5f]">
            {name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
          </div>
        )}
        <div className="flex flex-col">
          <p className="text-[16px] font-bold text-[#1f1f1f]">{name}</p>
          <Stars />
        </div>
      </div>
      <p className="mt-4 text-[16px] leading-7 text-[#4f4b47]">{review}</p>
      <p className="mt-3 text-[14px] text-[#6b6b6b]">{date}</p>
    </div>
  );
}

// function ReviewsSection() {
//   return (
//     <section className="w-full max-w-[1200px] px-[64px] pb-[64px]">
//       <h2 className="text-[24px] font-semibold text-[#1f1f1f]">Reviews</h2>
//       <div className="mt-[20px] grid gap-[16px] md:grid-cols-2">
//         <ReviewCard
//           name="Maria Santos"
//           text="The bouquet looked even better in person. The colors were soft and elegant, and delivery was on time."
//         />
//         <ReviewCard
//           name="Juan Dela Cruz"
//           text="Very fresh flowers and nicely arranged. Great for an anniversary gift or a simple surprise."
//         />
//       </div>
//     </section>
//   );
// }
function ReviewsSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  const allReviews = [
    {
      name: "Maria Santos",
      review: "The bouquet looked even better in person. The colors were soft and elegant, and delivery was on time.",
      date: "3 days ago",
    },
    {
      name: "Juan Dela Cruz",
      review: "Very fresh flowers and nicely arranged. Great for an anniversary gift or a simple surprise.",
      date: "1 week ago",
    },
    {
      name: "Rock Dela Rosa",
      review: "Absolutely gorgeous arrangements! My go-to florist for any occasion.",
      date: "3 days ago",
    },
    {
      name: "Sarah Johnson",
      review: "Exceeded my expectations! Beautiful arrangement and fast delivery.",
      date: "2 weeks ago",
    },
    {
      name: "Michael Chen",
      review: "Perfect for my wife's birthday. She loved it!",
      date: "3 weeks ago",
    },
    {
      name: "Emma Wilson",
      review: "The freshness and quality are exceptional. Highly recommended!",
      date: "1 month ago",
    },
    {
      name: "David Brown",
      review: "Great customer service and beautiful flowers. Will order again!",
      date: "1 month ago",
    },
  ];

  const displayedReviews = isExpanded ? allReviews : allReviews.slice(0, 3);
  const totalReviews = allReviews.length;

  return (
    <section className="w-full max-w-[1200px] px-[64px] pb-[64px]">
      <div className="flex items-end justify-between">
        <h2 className="text-[32px] font-bold text-[#1f1f1f]">Customer Reviews</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[16px] font-medium text-[#1f1f1f] hover:text-[#D24B46] underline cursor-pointer transition"
        >
          {isExpanded ? "Show less" : `View all ${totalReviews} reviews`}
        </button>
      </div>
      <div className={`mt-[24px] grid gap-[20px] lg:grid-cols-3 transition-all ${isExpanded ? "" : ""}`}>
        {displayedReviews.map((review, index) => (
          <ReviewCard
            key={index}
            name={review.name}
            review={review.review}
            date={review.date}
          />
        ))}
      </div>
    </section>
  );
}

export function ProductDetailLayout() {
  return (
    <div className="flex w-full flex-col items-center bg-[#fbf7f4]">
      <ProductDetails />
      <ReviewsSection />
    </div>
  );
}