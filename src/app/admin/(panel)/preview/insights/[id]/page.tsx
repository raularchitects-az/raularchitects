import { notFound } from "next/navigation";
import { getEntity } from "@/lib/cms/queries";
import { BlogBody } from "@/lib/blog-body";

function markdownToBlocks(body: string) {
  if (!body.trim()) return [];
  return body.split(/\n\n+/).map((chunk) => {
    const text = chunk.trim();
    if (text.startsWith("## ")) return { type: "h2" as const, text: text.slice(3) };
    if (text.startsWith("### ")) return { type: "h3" as const, text: text.slice(4) };
    if (text.split("\n").every((line) => line.trim().startsWith("- "))) {
      return {
        type: "ul" as const,
        items: text.split("\n").map((line) => line.replace(/^\s*-\s*/, "")),
      };
    }
    return { type: "p" as const, text };
  });
}

export default async function InsightPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string }>;
}) {
  const { id } = await params;
  const { locale: localeParam } = await searchParams;
  const locale =
    localeParam === "en" || localeParam === "de" || localeParam === "ru" || localeParam === "az"
      ? localeParam
      : "az";
  const row = await getEntity("insights", id);
  if (!row) notFound();
  const t = row.translations?.[locale] ?? {};
  const title = t.title || t.name || "Tərcümə yoxdur";
  const cover = row.cover_path || row.og_image_path;

  return (
    <article className="mx-auto max-w-3xl bg-white p-6 sm:p-10">
      <p className="text-xs uppercase tracking-[0.18em] text-charcoal/40">
        Preview · {row.status} · {row.is_active ? "aktiv" : "deaktiv"}
      </p>
      <div className="mt-4 flex gap-3 text-xs uppercase tracking-[0.14em]">
        {["az", "en", "de", "ru"].map((code) => (
          <a
            key={code}
            href={`/admin/preview/insights/${id}?locale=${code}`}
            className={code === locale ? "font-semibold" : ""}
          >
            {code}
          </a>
        ))}
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.14em] text-charcoal/45">{row.category}</p>
      <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
      {row.published_at ? (
        <p className="mt-2 text-sm text-charcoal/50">{row.published_at.slice(0, 10)}</p>
      ) : null}
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt={t.imageAlt || title} className="mt-8 w-full object-cover" />
      ) : null}
      <div className="mt-10">
        <BlogBody blocks={markdownToBlocks(t.body || t.full || "")} />
      </div>
    </article>
  );
}
