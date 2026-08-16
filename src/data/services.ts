export type ServiceMeta = {
  slug: string;
  number: string;
  icon: string;
};

export const services: ServiceMeta[] = [
  { slug: "bim-ile-layihelendirme", number: "01", icon: "Boxes" },
  { slug: "tikinti-ve-temir", number: "02", icon: "HardHat" },
  { slug: "interyer-dizayn", number: "03", icon: "Sofa" },
  { slug: "seherselme-layiheleri", number: "04", icon: "Building2" },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
