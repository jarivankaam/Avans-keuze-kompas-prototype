'use client'

import Image from 'next/image'

type HeroSectionProps = {
  heading: string
  description?: string
  imageSrc: string
  imageAlt: string
}

export default function HeroSection({ heading, description, imageSrc, imageAlt }: HeroSectionProps) {
  return (
    <section className="py-20 px-5 min-h-[480px]">
      <div className="container mx-auto p-5 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center p-[60px]">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-color">
              {heading}
            </h1>
            {description && <p className="mt-4 text-lg">{description}</p>}
          </div>
          <div>
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={800}
              height={600}
              sizes="(max-width: 800px) 100vw, 800px"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
