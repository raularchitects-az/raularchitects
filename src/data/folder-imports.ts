import { getImportedEntry as getPortfolioFolderEntry } from "@/data/raul-portfolio-import";
import { get13ProjectEntry } from "@/data/raul-13-project-import";

export function getImportedEntry(slug: string) {
  return getPortfolioFolderEntry(slug) ?? get13ProjectEntry(slug);
}
