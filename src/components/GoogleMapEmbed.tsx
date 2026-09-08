// Google's query-embed endpoint needs no API key and works for any address —
// https://www.google.com/maps?q=<address>&output=embed.
export default function GoogleMapEmbed({ query, title }: { query: string; title: string }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  return (
    <iframe
      src={src}
      title={title}
      className="w-full h-[220px] border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
