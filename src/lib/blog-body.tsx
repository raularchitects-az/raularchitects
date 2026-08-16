import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { BlogBlock } from "@/data/blog/types";

const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(linkPattern.source, "g");

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const [, label, href] = match;
    nodes.push(
      <Link
        key={`${href}-${match.index}`}
        href={href}
        className="text-bronze-dark underline decoration-bronze-dark/30 underline-offset-4 transition-colors duration-300 hover:decoration-bronze-dark"
      >
        {label}
      </Link>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, index) => {
        if (block.type === "h2" && block.text) {
          return (
            <h2 key={index} className="mt-6 text-2xl font-semibold text-charcoal sm:text-3xl">
              {block.text}
            </h2>
          );
        }
        if (block.type === "h3" && block.text) {
          return (
            <h3 key={index} className="mt-2 text-xl font-semibold text-charcoal">
              {block.text}
            </h3>
          );
        }
        if (block.type === "ul" && block.items) {
          return (
            <ul key={index} className="flex flex-col gap-2 pl-5">
              {block.items.map((item) => (
                <li key={item} className="list-disc text-base leading-relaxed text-charcoal/75">
                  <RichText text={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "p" && block.text) {
          return (
            <p key={index} className="text-base leading-[1.8] text-charcoal/75 sm:text-[1.05rem]">
              <RichText text={block.text} />
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}
