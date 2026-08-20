import { ContentForm } from "@/components/admin/content-form";
import { loadMedia } from "@/lib/cms/queries";

export default async function NewPortfolioPage() {
  const { items: media, error: mediaError } = await loadMedia();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Yeni portfolio</h1>
      <ContentForm table="portfolio" media={media} mediaError={mediaError} afterSaveHref="/admin/portfolio" />
    </div>
  );
}
