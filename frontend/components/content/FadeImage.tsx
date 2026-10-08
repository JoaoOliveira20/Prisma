"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ComponentProps } from "react";

export function FadeImage({ className = "", onLoad, alt, ...props }: ComponentProps<typeof Image>) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <Image
      ref={ref}
      alt={alt}
      {...props}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      className={`${className} transition-opacity duration-500 ease-[var(--ease-out)] motion-reduce:transition-none ${loaded ? "opacity-100" : "opacity-0"}`}
    />
  );
}
