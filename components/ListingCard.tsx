import Link from "next/link";
import FavoriteButton from "./FavoriteButton";
import { formatPrice } from "@/lib/format";

export type ListingCardData = {
  id: string;
  title: string;
  price_usd: number | string;
  images: string[];
  province: string;
  city: string | null;
  negotiable?: boolean;
  condition?: string;
  created_at?: string;
};

function Placeholder() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-14 h-14 text-ink/15"
        aria-hidden
      >
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
      </svg>
    </div>
  );
}

export default function ListingCard({
  listing,
  favSet,
}: {
  listing: ListingCardData;
  favSet?: Set<string>;
}) {
  const img = listing.images?.[0];

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group card card-hover overflow-hidden flex flex-col"
    >
      <div className="aspect-[4/3] bg-sand/60 relative overflow-hidden border-b-2 border-ink/10">
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton
            listingId={listing.id}
            initial={favSet?.has(listing.id) ?? false}
          />
        </div>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
          />
        ) : (
          <Placeholder />
        )}
        {listing.condition === "nuevo" && (
          <span className="absolute top-2 left-2 bg-sun text-ink text-[11px] font-bold px-2 py-0.5 rounded-full border border-ink">
            Nuevo
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 grow">
        <p className="font-display text-xl font-extrabold text-ink leading-tight">
          {formatPrice(listing.price_usd)}
        </p>
        {listing.negotiable && (
          <span className="text-xs text-palm font-semibold">
            ✔ Precio negociable
          </span>
        )}
        <p className="text-sm text-ink line-clamp-2">{listing.title}</p>
        <p className="text-xs text-ink-soft mt-auto pt-1">
          {[listing.city, listing.province].filter(Boolean).join(", ")}
        </p>
      </div>
    </Link>
  );
}
