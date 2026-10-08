import Image from "next/image";

type CoverImageProps = {
  name: string;
  coverUrl: string | null;
  className?: string;
  sizes?: string;
};

export function CoverImage({ name, coverUrl, className = "", sizes = "320px" }: CoverImageProps) {
  return (
    <div className={`relative overflow-hidden bg-night bg-cover bg-center ${className}`} style={{ backgroundImage: "url(/images/backgrounds/prism-light-dark.png)" }}>
      {coverUrl ? (
        <Image src={coverUrl} alt={name} fill unoptimized sizes={sizes} className="object-cover" />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center font-serif text-3xl text-night-text/90">
          {name.charAt(0)}
        </span>
      )}
    </div>
  );
}
