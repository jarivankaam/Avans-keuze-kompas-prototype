"use client";

import Image from "next/image";

type HeroSectionProps = {
  heading: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  background: string;
};

export default function HeroSection({
  heading,
  description,
  imageSrc,
  imageAlt,
  background,
}: HeroSectionProps) {
  return (
    <section className="px-5 max-h-[480px] w-full mb-[50px]">
      <div className="container mx-auto p-5 rounded-2xl" style={{ background }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
              {heading}
            </h1>
            {description && <p className="mt-4 text-lg">{description}</p>}
          </div>
          <div className="max-h-[384px] overflow-hidden h-full w-full">
            <Image
              className="w-full h-full object-contain"
              src={imageSrc}
              alt={imageAlt}
              sizes="(max-width: 800px) 100vw, 800px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
