import { ContentForm } from "@/components/admin/content-form";
import { listMedia } from "@/lib/cms/queries";

export default async function NewServicePage() {
  const media = await listMedia();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Yeni xidmət</h1>
      <ContentForm table="services" media={media} afterSaveHref="/admin/services" />
    </div>
  );
}
