import Link from "next/link";
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
        className="w-14 h-14 text-gray-300"
        aria-hidden
      >
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
      </svg>
    </div>
  );
}

export default function ListingCard({ listing }: { listing: ListingCardData }) {
  const img = listing.images?.[0];

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group bg-white rounded-md overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.18)] transition-shadow flex flex-col"
    >
      <div className="aspect-[4/3] bg-[#f7f7f7] relative overflow-hidden">
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
          <span className="absolute top-2 left-2 bg-brand-blue text-white text-[11px] font-semibold px-2 py-0.5 rounded">
            Nuevo
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 grow">
        <p className="text-xl text-gray-900 leading-tight">
          {formatPrice(listing.price_usd)}
        </p>
        {listing.negotiable && (
          <span className="text-xs text-brand-green font-semibold">
            Precio negociable
          </span>
        )}
        <p className="text-sm text-gray-700 line-clamp-2">{listing.title}</p>
        <p className="text-xs text-gray-400 mt-auto pt-1">
          {[listing.city, listing.province].filter(Boolean).join(", ")}
        </p>
      </div>
    </Link>
  );
}
