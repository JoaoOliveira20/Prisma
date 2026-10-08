export function Paragraphs({ text }: { text: string }) {
  return (
    <div className="max-w-prose space-y-4 text-[15px] leading-relaxed">
      {text.split("\n\n").map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}
