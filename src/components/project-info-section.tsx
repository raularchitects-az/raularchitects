import { Container } from "@/components/ui/container";

type Fact = {
  label: string;
  value?: string | null;
};

export function ProjectInfoSection({
  facts,
  description,
  descriptionLabel,
}: {
  facts: Fact[];
  description: string;
  descriptionLabel: string;
}) {
  if (!description && facts.every((fact) => !fact.value)) return null;

  const paragraphs = description
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <section className="border-b border-charcoal/10 bg-cream py-16 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-x-20 lg:gap-y-12 xl:grid-cols-[minmax(0,16rem)_1fr]">
          <dl className="space-y-8">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-sm font-bold uppercase tracking-[0.04em] text-charcoal">{fact.label}</dt>
                {fact.value ? (
                  <dd className="mt-2 text-sm font-light leading-relaxed text-charcoal/80">{fact.value}</dd>
                ) : null}
              </div>
            ))}
          </dl>

          {description ? (
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.04em] text-charcoal">{descriptionLabel}</p>
              <div className="mt-4 max-w-3xl space-y-4">
                {(paragraphs.length ? paragraphs : [description]).map((paragraph, index) => (
                  <p key={index} className="text-sm font-normal leading-relaxed text-charcoal sm:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
