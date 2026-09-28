# Raul Architects Insights hesabatı

Tarix: 28 sentyabr 2026

## Nəticə

Təqdim edilmiş `Interyer.pdf` və `Hibrid binalar.pdf` sənədləri redaksiya materialı kimi təhlil edildi. Sənədlərdəki mövzular 12 ayrıca insight məqaləsinə çevrildi və Raul Architects saytının mövcud CMS sistemində yayımlandı.

- 4 interyer mövzusu: fokal nöqtə, simmetrik balans, asimmetrik balans, vurğu.
- 8 hibrid konstruksiya mövzusu: sistem anlayışı, beton-polad-ağac seçimi, beton nüvə və polad karkas, taxta-beton döşəmə, birləşmə detalları, üstünlüklər və seçim meyarları, yanğın təhlükəsizliyi, sökülmə və təkrar istifadə.
- Hər məqalə Azərbaycan, ingilis, alman və rus dillərində hazırlanıb: cəmi 48 lokal səhifə.
- Hər məqalə üçün ayrıca 1600 × 1000 WebP üz qabığı hazırlanıb və media anbarına yüklənib.
- Əvvəlki 10 insight saxlanılıb və dəyişdirilməyib.

## Redaksiya yanaşması

PDF məzmunu sözbəsöz köçürülməyib. Mövzular axtarış niyyətinə uyğun ayrılıb, terminlər dəqiqləşdirilib və oxunaqlı məqalə strukturuna salınıb. Texniki mövzularda şərtsiz qənaət, davamlılıq və yanğın təhlükəsizliyi vədlərindən qaçılıb. Konstruktiv birləşmələr, kompozit iş və yanğın davranışı ilə bağlı məqalələrdə əlavə peşəkar mənbələrə keçid verilib.

Üz qabıqları AI ilə hazırlanmış konseptual illüstrasiyalar kimi açıq qeyd olunub; real icra edilmiş layihə və ya texniki detal kimi təqdim edilmir.

## SEO və dil yoxlaması

Canlı saytda 48 səhifənin hamısı aşağıdakı yoxlamalardan keçib:

- HTTP 200 və indekslənə bilən robots etiketi;
- lokal SEO başlığı və meta description;
- özünə aid canonical URL;
- AZ, EN, DE, RU və x-default hreflang əlaqələri;
- Open Graph və Twitter böyük şəkil metadatası;
- ayrıca H1 və düzgün H2/list mətn strukturu;
- `Article` JSON-LD, tarix, müəllif və publisher məlumatları;
- lokal şəkil alt mətni və CTA;
- lokal daxili əlaqəli məqalə keçidləri;
- 12 sosial paylaşım şəklinin əlçatanlığı;
- dörd dil üzrə Insights siyahısında bütün yeni məqalələrin görünməsi.

## Kod və deployment

`src/app/sitemap.ts` üçün 60 saniyəlik revalidation əlavə edilib. Bu dəyişiklik CMS-dən birbaşa əlavə edilən yeni məqalələrin sitemap keşində köhnə qalmasının qarşısını alır. Production build uğurla tamamlanıb və lokal build nəticəsində sitemap bütün 48 yeni lokal URL-i ehtiva edir.

Hazırda canlı sitemap əvvəlki deployment-in keşindədir. Kod repoya push edilib Vercel deployment tamamlandıqdan sonra `node scripts/verify-pdf-insights.mjs` yenidən işə salınmalıdır; həmin yoxlama sitemap daxil olmaqla bütün canlı SEO tələblərini təsdiqləyəcək.

## Yoxlama nəticələri

- `npm run build`: keçdi.
- ESLint: xəta yoxdur.
- `git diff --check`: xəta yoxdur.
- 48 canlı səhifə: səhifə səviyyəli yoxlamalar keçdi.
- 12 cover şəkli: yüklənib və WebP kimi cavab verir.
- Canlı sitemap: deployment gözləyir.
