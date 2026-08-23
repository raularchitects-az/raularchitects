/**
 * Shared public-site widescreen layout.
 * Below 1600px the default Container max-w-7xl (1280px) applies unchanged.
 * From 1600px upward the content area scales for large and ultrawide monitors.
 */
export const PUBLIC_WIDE_CONTAINER =
  "min-[1600px]:max-w-[1440px] min-[2560px]:max-w-[1600px] min-[3440px]:max-w-[1728px]";

export const PUBLIC_WIDE_PADDING =
  "min-[1600px]:px-12 min-[2560px]:px-14 min-[3440px]:px-16";

/** 3-column editorial listing grid — matches homepage Projects / Insights proportions. */
export const PUBLIC_EDITORIAL_GRID =
  "grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-12 min-[1600px]:gap-14 min-[2560px]:gap-16";

export const PUBLIC_INSIGHTS_GRID =
  "grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12 min-[1600px]:gap-14 min-[2560px]:gap-16";

/** Readable article / prose column inside a wide page shell. */
export const PUBLIC_READABLE_COLUMN =
  "mx-auto w-full max-w-3xl xl:max-w-[40rem] min-[1600px]:max-w-[44rem] min-[2560px]:max-w-[48rem]";

/** Project detail facts + description two-column layout. */
export const PUBLIC_PROJECT_INFO_GRID =
  "grid gap-12 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-x-20 lg:gap-y-12 xl:grid-cols-[minmax(0,16rem)_1fr] min-[1600px]:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] min-[1600px]:gap-x-24 min-[2560px]:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] min-[2560px]:gap-x-28";

export const PUBLIC_PROJECT_DESCRIPTION =
  "max-w-3xl min-[1600px]:max-w-[44rem] min-[2560px]:max-w-[48rem]";

export const PUBLIC_ARTICLE_COVER_SIZES =
  "(min-width: 2560px) 48rem, (min-width: 1600px) 44rem, (min-width: 768px) 40rem, 100vw";

/** Insight article detail page — wider shell from 1600px (detail route only). */
export const PUBLIC_INSIGHT_DETAIL_COLUMN =
  "mx-auto w-full max-w-3xl xl:max-w-[40rem] min-[1600px]:max-w-[68rem] min-[2560px]:max-w-[72rem] min-[3440px]:max-w-[75rem]";

/** Insight body prose — full detail width until ultrawide, then cap line length. */
export const PUBLIC_INSIGHT_DETAIL_BODY =
  "w-full min-[2560px]:max-w-[52rem] min-[3440px]:max-w-[54rem]";

export const PUBLIC_INSIGHT_DETAIL_BODY_TYPO =
  "min-[1600px]:text-[1.0625rem] min-[1600px]:leading-[1.85] min-[1600px]:[&_p]:text-[1.0625rem] min-[1600px]:[&_p]:leading-[1.85] min-[1600px]:[&_li]:text-[1.0625rem] min-[1600px]:[&_li]:leading-[1.85] min-[1600px]:[&_h2]:text-[1.0625rem] min-[1600px]:[&_h3]:text-[1.0625rem] min-[1600px]:[&_.flex]:gap-7";

export const PUBLIC_INSIGHT_COVER_SIZES =
  "(min-width: 3440px) 75rem, (min-width: 2560px) 72rem, (min-width: 1600px) 68rem, (min-width: 768px) 40rem, 100vw";
