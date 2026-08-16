import { ContentForm } from "@/components/admin/content-form";
import { listMedia } from "@/lib/cms/queries";

export default async function NewProjectPage() {
  const media = await listMedia();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Yeni layihə</h1>
      <ContentForm table="projects" media={media} afterSaveHref="/admin/projects" />
    </div>
  );
}
