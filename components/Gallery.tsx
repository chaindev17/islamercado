"use client";

import { useState } from "react";

export default function Gallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [idx, setIdx] = useState(0);
  const list = images?.length ? images : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[4/3] bg-[#f7f7f7] rounded-md overflow-hidden flex items-center justify-center">
        {list.length ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={list[idx]}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-20 h-20 text-ink/15"
            aria-hidden
          >
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {list.map((src, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`w-16 h-16 rounded-md overflow-hidden bg-[#f7f7f7] ${
                i === idx ? "ring-2 ring-mar" : "opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
