import { blogAudioLabels, formatAudioDuration, type BlogAudioEntry } from "@/lib/blog/audio";
import { insightAudioLabels, type InsightAudioEntry } from "@/lib/insights/audio";

type AudioEntry = BlogAudioEntry | InsightAudioEntry;

export function BlogAudioPlayer({
  entry,
  variant = "blog",
}: {
  entry: AudioEntry;
  variant?: "blog" | "insight";
}) {
  const labels = variant === "insight" ? insightAudioLabels : blogAudioLabels;
  const label = labels[entry.lang];
  const duration = formatAudioDuration(entry.duration_seconds);
  return (
    <div className="blog-audio mt-8 max-w-lg">
      <p className="mb-2 flex gap-2 text-sm text-charcoal/55">
        <span>{label}</span>
        <span aria-hidden="true">·</span>
        <span>{duration}</span>
      </p>
      <audio
        controls
        preload="none"
        src={entry.url}
        aria-label={`${label} (${duration})`}
        className="block h-10 w-full"
      />
    </div>
  );
}
