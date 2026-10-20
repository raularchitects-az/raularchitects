import { saveSettings } from "@/lib/cms/actions";
import { getSettingsAdmin } from "@/lib/cms/queries";
import { Field, SubmitButton, TextArea, TextInput } from "@/components/admin/fields";

export default async function AdminPagesPage() {
  const [hero, contact, about, footer, home] = await Promise.all([
    getSettingsAdmin("hero"),
    getSettingsAdmin("contact"),
    getSettingsAdmin("about"),
    getSettingsAdmin("footer"),
    getSettingsAdmin("home"),
  ]);

  async function save(formData: FormData) {
    "use server";
    await saveSettings("hero", {
      raulName: String(formData.get("raulName") ?? ""),
      role1: String(formData.get("role1") ?? ""),
      role2: String(formData.get("role2") ?? ""),
      roleLine2: String(formData.get("roleLine2") ?? ""),
      roleLine3: String(formData.get("roleLine3") ?? ""),
      photoDesktop: String(formData.get("photoDesktop") ?? ""),
      photoMobile: String(formData.get("photoMobile") ?? ""),
      identityHref: String(formData.get("identityHref") ?? ""),
    });
    await saveSettings("contact", {
      email: String(formData.get("email") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
      azerbaijan: { phone: String(formData.get("az_phone") ?? ""), address: String(formData.get("az_address") ?? "") },
      germany: { phone: String(formData.get("de_phone") ?? ""), address: String(formData.get("de_address") ?? "") },
      switzerland: { phone: String(formData.get("ch_phone") ?? ""), address: String(formData.get("ch_address") ?? "") },
    });
    await saveSettings("about", {
      intro: String(formData.get("about_intro") ?? ""),
      certificates: String(formData.get("about_certificates") ?? ""),
    });
    await saveSettings("footer", { credit: String(formData.get("footer_credit") ?? "") });
    await saveSettings("home", {
      showProjects: formData.get("showProjects") === "on",
      showPortfolio: formData.get("showPortfolio") === "on",
      showInsights: formData.get("showInsights") === "on",
      showBlog: formData.get("showBlog") === "on",
      showServices: formData.get("showServices") === "on",
    });
  }

  const heroV = hero ?? {};
  const contactV = contact ?? {};
  const az = (contactV.azerbaijan as Record<string, string> | undefined) ?? {};
  const de = (contactV.germany as Record<string, string> | undefined) ?? {};
  const ch = (contactV.switzerland as Record<string, string> | undefined) ?? {};
  const homeV = home ?? {};

  return (
    <form action={save} className="flex max-w-3xl flex-col gap-8">
      <h1 className="text-3xl font-semibold">Səhifələr və ana səhifə</h1>
      <section className="flex flex-col gap-4 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em]">Hero</h2>
        <Field label="Ad"><TextInput name="raulName" defaultValue={String(heroV.raulName ?? "")} /></Field>
        <Field label="Role 1"><TextInput name="role1" defaultValue={String(heroV.role1 ?? "")} /></Field>
        <Field label="Role 2"><TextInput name="role2" defaultValue={String(heroV.role2 ?? "")} /></Field>
        <Field label="Mobil role 2"><TextInput name="roleLine2" defaultValue={String(heroV.roleLine2 ?? "")} /></Field>
        <Field label="Mobil role 3"><TextInput name="roleLine3" defaultValue={String(heroV.roleLine3 ?? "")} /></Field>
        <Field label="Desktop foto"><TextInput name="photoDesktop" defaultValue={String(heroV.photoDesktop ?? "/images/raul-hero.jpg")} /></Field>
        <Field label="Mobil foto"><TextInput name="photoMobile" defaultValue={String(heroV.photoMobile ?? "/images/raul-hero-mobile.jpg")} /></Field>
        <Field label="Ad bloku linki"><TextInput name="identityHref" defaultValue={String(heroV.identityHref ?? "/haqqimizda/raul-nagiyev")} /></Field>
      </section>
      <section className="flex flex-col gap-4 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em]">Əlaqə / WhatsApp</h2>
        <Field label="Email"><TextInput name="email" defaultValue={String(contactV.email ?? "")} /></Field>
        <Field label="WhatsApp link"><TextInput name="whatsapp" defaultValue={String(contactV.whatsapp ?? "")} /></Field>
        <Field label="AZ telefon"><TextInput name="az_phone" defaultValue={az.phone ?? ""} /></Field>
        <Field label="AZ ünvan"><TextInput name="az_address" defaultValue={az.address ?? ""} /></Field>
        <Field label="DE telefon"><TextInput name="de_phone" defaultValue={de.phone ?? ""} /></Field>
        <Field label="DE ünvan"><TextInput name="de_address" defaultValue={de.address ?? ""} /></Field>
        <Field label="CH telefon"><TextInput name="ch_phone" defaultValue={ch.phone ?? ""} /></Field>
        <Field label="CH ünvan"><TextInput name="ch_address" defaultValue={ch.address ?? ""} /></Field>
      </section>
      <section className="flex flex-col gap-4 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em]">Haqqımızda / Footer</h2>
        <Field label="Haqqımızda intro"><TextArea name="about_intro" defaultValue={String((about ?? {}).intro ?? "")} /></Field>
        <Field label="Sertifikatlar (hər sətirdə bir)"><TextArea name="about_certificates" defaultValue={String((about ?? {}).certificates ?? "")} /></Field>
        <Field label="Footer əlavə mətn"><TextInput name="footer_credit" defaultValue={String((footer ?? {}).credit ?? "")} /></Field>
      </section>
      <section className="flex flex-col gap-3 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em]">Ana səhifə bölmələri</h2>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showServices" defaultChecked={homeV.showServices !== false} /> Xidmətlər</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showProjects" defaultChecked={homeV.showProjects !== false} /> Layihələr</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showPortfolio" defaultChecked={homeV.showPortfolio !== false} /> Portfolio (rollout qeyri-aktiv ikən)</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showInsights" defaultChecked={(homeV.showInsights ?? homeV.showPortfolio) !== false} /> Insights (rollout aktiv olanda)</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showBlog" defaultChecked={Boolean(homeV.showBlog)} /> Bloq (seçilmiş yazılar)</label>
      </section>
      <SubmitButton>Saxla</SubmitButton>
    </form>
  );
}
