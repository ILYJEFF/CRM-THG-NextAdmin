type MarketingDocumentCardProps = {
  title: string;
  description?: string;
  href: string | null;
  emptyText?: string;
  fileLabel?: string;
};

export function MarketingDocumentCard({
  title,
  description,
  href,
  emptyText = "No document was uploaded with this submission.",
  fileLabel = "Open document",
}: MarketingDocumentCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm text-zinc-600">{description}</p>
      ) : null}
      <div className="mt-4">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 text-sm font-semibold text-zinc-950 shadow-sm ring-1 ring-amber-600/20 transition hover:from-amber-400 hover:to-amber-500 sm:w-auto"
          >
            {fileLabel}
          </a>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-6 text-center text-sm text-zinc-500">
            {emptyText}
          </p>
        )}
      </div>
    </section>
  );
}
