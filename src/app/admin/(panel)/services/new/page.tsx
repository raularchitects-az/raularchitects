import { ContentForm } from "@/components/admin/content-form";
import { loadMedia } from "@/lib/cms/queries";

export default async function NewServicePage() {
  const { items: media, error: mediaError } = await loadMedia();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Yeni xidmət</h1>
      <ContentForm table="services" media={media} mediaError={mediaError} afterSaveHref="/admin/services" />
    </div>
  );
}
