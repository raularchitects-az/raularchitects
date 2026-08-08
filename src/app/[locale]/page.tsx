import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Services } from "@/components/sections/services";
import { Bim } from "@/components/sections/bim";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/footer";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Bim />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
