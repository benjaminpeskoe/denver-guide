import Link from "next/link";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function NotesRenderer({ text }: { text: string }) {
  const parts = text.split(/(\[\[.*?\]\])/g);

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[\[(.*?)\]\]$/);
        if (match) {
          const name = match[1];
          return (
            <Link
              key={i}
              href={`/place/${slugify(name)}`}
              className="text-sky-700 hover:text-sky-800 underline underline-offset-2"
            >
              {name}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
