import { FadeImage } from "./FadeImage";

type CoverImageProps = {
  name: string;
  coverUrl: string | null;
  className?: string;
  sizes?: string;
};

export function CoverImage({ name, coverUrl, className = "", sizes = "320px" }: CoverImageProps) {
  return (
    <div className={`@container relative overflow-hidden bg-surface ${className}`}>
      {coverUrl ? (
        <FadeImage src={coverUrl} alt={name} fill unoptimized sizes={sizes} className="object-cover" />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 grid select-none place-items-center font-serif leading-none text-text/20" style={{ fontSize: "46cqw" }}>
          {name.charAt(0)}
        </span>
      )}
    </div>
  );
}
