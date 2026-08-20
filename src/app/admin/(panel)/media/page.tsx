import { MediaLibrary } from "@/components/admin/media-library";
import { loadMedia } from "@/lib/cms/queries";

export default async function AdminMediaPage() {
  const { items, error } = await loadMedia();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Media</h1>
      <MediaLibrary items={items} loadError={error} />
    </div>
  );
}
