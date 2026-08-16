import { ContentForm } from "@/components/admin/content-form";
import { listMedia } from "@/lib/cms/queries";

export default async function NewPortfolioPage() {
  const media = await listMedia();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Yeni portfolio</h1>
      <ContentForm table="portfolio" media={media} afterSaveHref="/admin/portfolio" />
    </div>
  );
}
