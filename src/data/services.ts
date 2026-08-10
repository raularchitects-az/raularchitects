export type ServiceMeta = {
  slug: string;
  number: string;
  icon: string;
};

export const services: ServiceMeta[] = [
  { slug: "tikinti-ve-temir", number: "01", icon: "HardHat" },
  { slug: "bim-ile-layihelendirme", number: "02", icon: "Boxes" },
  { slug: "interyer-dizayn", number: "03", icon: "Sofa" },
  { slug: "seherselme-layiheleri", number: "04", icon: "Building2" },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
