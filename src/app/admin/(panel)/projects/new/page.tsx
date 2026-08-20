import { ContentForm } from "@/components/admin/content-form";
import { loadMedia } from "@/lib/cms/queries";

export default async function NewProjectPage() {
  const { items: media, error: mediaError } = await loadMedia();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Yeni layihə</h1>
      <ContentForm table="projects" media={media} mediaError={mediaError} afterSaveHref="/admin/projects" />
    </div>
  );
}
