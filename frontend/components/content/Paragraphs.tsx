export function Paragraphs({ text }: { text: string }) {
  const [first, ...rest] = text.split("\n\n");

  return (
    <div className="max-w-2xl space-y-6">
      <p className="font-serif text-2xl leading-snug">{first}</p>
      {rest.map((paragraph) => (
        <p key={paragraph} className="text-lg leading-8 text-text/90">{paragraph}</p>
      ))}
    </div>
  );
}
