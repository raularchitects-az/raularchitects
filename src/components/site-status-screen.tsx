import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";

const buttonClass =
  "inline-flex items-center justify-center border border-charcoal bg-charcoal px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:border-bronze-dark hover:bg-bronze-dark";

const ghostButtonClass =
  "inline-flex items-center justify-center border border-charcoal/20 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-charcoal transition-colors duration-300 hover:border-bronze-dark hover:text-bronze-dark";

export function SiteStatusScreen({
  title,
  body,
  homeLabel,
  retryLabel,
  onRetry,
}: {
  title: string;
  body: string;
  homeLabel: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <section className="bg-cream py-24 sm:py-32">
      <Container>
        <div className="flex max-w-xl flex-col gap-6">
          <span className="text-xs font-medium uppercase tracking-[0.28em] text-bronze-dark">Raul Architects</span>
          <h1 className="text-4xl font-semibold leading-[1.1] text-charcoal sm:text-5xl">{title}</h1>
          <p className="text-base font-light leading-relaxed text-charcoal/70 sm:text-lg">{body}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/" className={buttonClass}>
              {homeLabel}
            </Link>
            {onRetry && retryLabel ? (
              <button type="button" onClick={onRetry} className={ghostButtonClass}>
                {retryLabel}
              </button>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
