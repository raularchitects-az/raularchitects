# Raul Business Radar — Phase 2: SIMAP Switzerland

SIMAP Radar-ın ikinci rəsmi mənbəyi kimi əlavə edildi. Ayrıca panel, ayrıca baza və ya ictimai səhifə yaradılmadı: İsveçrə imkanları TED imkanları ilə eyni **Recommended Today**, **Today Opportunities**, **Top Opportunities** və **All Opportunities** siyahılarında görünür.

---

## 1. İstifadə olunan rəsmi inteqrasiya metodu

**Nəticə: rəsmi, sənədləşdirilmiş, maşınla oxunan API mövcuddur və istifadə edilir. Bloker yoxdur.**

simap.ch öz domenində OpenAPI 3 sənədi dərc edir və public oxu endpoint-lərini anonim HTTPS GET ilə verir.

| | |
|---|---|
| OpenAPI spesifikasiyası | `https://www.simap.ch/api/specifications/simap.yaml` (809 KB, endirilib yoxlanılıb) |
| Sənədləşmə | `https://www.simap.ch/api-doc` |
| Dəyişiklik jurnalı | `https://www.simap.ch/api/specifications/changelog.html` |
| Baza ünvan | `https://www.simap.ch/api` |
| Axtarış | `GET /publications/v2/project/project-search` — spesifikasiyada başlığı **"public project search"** |
| Detal | `GET /publications/v1/project/{projectId}/publication-details/{publicationId}` |

### Necə təsdiqləndi

Üçüncü tərəf iddialarına deyil, simap.ch-in öz sənədlərinə əsaslanıldı:

1. Rəsmi OpenAPI YAML endirildi və `project-search` əməliyyatı, bütün sorğu parametrləri və `ProjectsSearch` / `ProjectsSearchEntry` modelləri oxundu.
2. simap.ch-in öz changelog-u `orderAddressCountryOnlySwitzerland` və `orderAddressCantons` public axtarış filtrlərini, `cpvCodes` parametrini və endpoint versiyalarını təsdiqlədi.
3. **26.08.2026** tarixində autentifikasiyasız canlı sorğu göndərildi: hər iki endpoint **HTTP 200** qaytardı.

### Bir vacib qeyd (spesifikasiya ilə implementasiya arasındakı fərq)

Spesifikasiyada qlobal `security: SimapOIDC` bloku var və public endpoint-lər üçün `security: []` override-u **yoxdur**. Buna baxmayaraq gateway bu endpoint-ləri anonim sorğulara açıq şəkildə verir və simap-ın öz changelog-u public rolu üçün *"public – no restrictions: use the GET operation to retrieve content"* deyir.

Praktiki nəticə: **heç bir kredensial mövcud deyil və heç biri göndərilmir.** Heç bir giriş nəzarəti, CAPTCHA və ya məhdudiyyət keçilmir — endpoint sadəcə anonim sorğulara cavab verir. Əgər simap gələcəkdə bu endpoint-ləri bağlasa, klient 401/403 alacaq, sorğunu təkrarlamayacaq (401/403 daimi xəta sayılır) və `radar_runs`-a xəta yazılacaq.

### Qaydalara riayət

* **HTML scraping yoxdur.** Yalnız sənədləşdirilmiş JSON endpoint-ləri sorğulanır.
* **robots.txt-ə riayət olunur.** simap `/api`-ni qadağan etmir. Lakin `/de|/fr|/it|/en` altındakı `project-detail` marşrutunu qadağan edir — buna görə həmin səhifə **heç vaxt proqramla sorğulanmır**; ondan yalnız adminin klikləməsi üçün link kimi istifadə olunur.
* **Üçüncü tərəf mənbə yoxdur.** Yalnız simap.ch.
* **Ödənişli xidmət, API açarı və ya yeni email provayderi əlavə edilmədi.**

### Niyə iki sorğu lazımdır

Axtarış cavabı layihənin kimliyini, lotlarını və ünvanını verir, lakin **son tarix və CPV kodu daşımır** — onlar yalnız `publication-details` cavabındadır. Buna görə hər namizəd üçün bir detal sorğusu göndərilir. Bu, pulsuz ictimai xidmətə hörmət üçün icra başına **60 detal sorğusu** ilə məhdudlaşdırılıb (`MAX_DETAIL_REQUESTS`), eyni anda 4 sorğu ilə.

### Lisenziya qeydi

simap açıq data lisenziyası dərc etmir; istifadə simap.ch şərtlərinə tabedir. Radar məlumatı yalnız daxili admin panelində saxlanılır, ictimai saytda dərc olunmur və sitemap-a düşmür — bu, mövcud istifadə çərçivəsinə uyğundur.

---

## 2. Dəyişən fayllar və migrasiyalar

### Migrasiya (əl ilə icra tələb olunur)

* `supabase/patch-business-radar-simap.sql` — **yeni**. Cədvəl, sütun və ya policy yaratmır. Yalnız `radar_sources`-dakı SIMAP sətrini `planned` → `available` edir, aktivləşdirir və mənbələrarası təkrar yoxlaması üçün `radar_opportunities (source_ref)` indeksi əlavə edir.

### Yeni fayllar

| Fayl | Rolu |
|---|---|
| `src/lib/radar/sources/simap-query.ts` | Sorğu qurulması, ISO2→ISO3 ölkə kodu, rəsmi link formatı. Şəbəkəsiz, test edilə bilən. |
| `src/lib/radar/sources/simap-mapper.ts` | Rəsmi cavabların normallaşdırılması. Çoxdilli mətn seçimi, HTML təmizləmə, lot bölgüsü, TED istinadı. |
| `src/lib/radar/sources/simap.ts` | Rəsmi API klienti: timeout, retry, rolling pagination, detal limiti. |
| `src/lib/radar/sources/simap-fixture.ts` | Şəbəkəsiz test üçün `fetch` əvəzedicisi. |
| `src/lib/radar/sources/fixtures/simap-search-response.json` | 5 layihəlik nümunə axtarış cavabı (biri 2 lotlu). |
| `src/lib/radar/sources/fixtures/simap-publication-details.json` | Uyğun 5 nümunə detal cavabı. |

### Dəyişdirilmiş fayllar

| Fayl | Dəyişiklik |
|---|---|
| `src/lib/radar/sources/index.ts` | Placeholder SIMAP yerinə real mənbə. TED birinci qalır (mənbələrarası təkrar qərarı sabit olsun deyə). |
| `src/lib/radar/discovery.ts` | `runAllSources()` orkestratoru; mənbələrarası təkrar yoxlaması. Hər mənbə öz `radar_runs` sətrini saxlayır. |
| `src/app/api/radar/cron/route.ts` | Planlaşdırılmış iş artıq bütün aktiv mənbələri işlədir. |
| `src/lib/radar/actions.ts` | `runRadarNow()` mənbəsiz çağırıldıqda hamısını işlədir. |
| `src/components/admin/radar/run-panel.tsx` | Manual axtarış bütün mənbələri əhatə edir. |
| `src/lib/radar/types.ts` | `SourceOpportunity`-yə `summary` və `crossSourceRefs`; `SOURCE_LABEL`. |
| `src/lib/radar/sources/ted-mapper.ts` | Yeni sahələr üçün `null` / `[]` (TED-də təsvir sahəsi yoxdur — heç nə uydurulmur). |
| `src/lib/radar/taxonomy.ts` | FR/IT terminologiya, İsveçrəyə xas terminlər, BIM təlimi istisnası, termin uyğunlaşdırma düzəlişi. |
| `src/lib/radar/scoring.ts` | İki ayrı mətn sahəsi (aşağıda izah olunub), memarlıq terminologiyasının sübut kimi sayılması, `absolute` istisna dəstəyi. |
| `src/lib/radar/self-check.ts` | 16 SIMAP yoxlaması əlavə edildi; TED yoxlamaları prefikslə ayrıldı. |
| `src/components/admin/radar/opportunity-card.tsx` | Kartda mənbə etiketi. |
| `src/app/admin/(panel)/radar/[id]/page.tsx` | Detalda mənbə etiketi, lot sahəsi, mənbəyə uyğun mətnlər. |
| `src/app/admin/(panel)/radar/advanced/page.tsx` | "Phase 2" etiketi artıq mənbədən asılı olmayan mətnlə əvəz olundu. |

**Toxunulmayanlar:** ictimai səhifələr, Projects, Insights, Blog, Services, tərcümələr, CMS media davranışı, Radar-ın UI strukturu, mövcud email qaydaları, TED mənbəyinin davranışı.

---

## 3. Məlumatın saxlanması və təkrarlanma

Hər SIMAP imkanı iki rəsmi sənəddən qurulur və hər ikisi `raw` sütununda **olduğu kimi** saxlanılır (`{ search, detail }`).

| Tələb | Necə saxlanılır |
|---|---|
| Rəsmi link | `https://www.simap.ch/{dil}/project-detail/{projectId}` — elanın öz dilində |
| Rəsmi istinad nömrəsi | `source_ref` = layihə nömrəsi (məs. `42963`) |
| Rəsmi elan versiyası | `notice_version` = elan nömrəsi / Meldungsnummer (məs. `42963-01`) |
| Prosedur ID | `procedure_ref` = layihə UUID-i |
| Mənbə adı | `source_id` = `simap`, UI-da **SIMAP Switzerland** |
| Dərc tarixi | `published_at` |
| Son tarix | `deadline_at` = `dates.offerDeadline` (yalnız rəsmi verildikdə) |
| Sifarişçi təşkilat | `buyer_name` = rəsmi satınalma ofisi |
| Kanton / şəhər | `city` = `Zürich (ZH)` formatında |
| Müqavilə dəyəri | **Həmişə boş.** SIMAP tender elanları dəyər dərc etmir (yalnız award elanları edir, onlar isə oxunmur). Heç nə uydurulmur. |

**Təkrarlanma açarı:** `(source_id, source_ref, source_lot)` — mövcud unikal məhdudiyyət. Layihə nömrəsi düzəlişlər arasında sabit qaldığı üçün **düzəliş və ya yeni rəsmi versiya mövcud sətri yeniləyir**, yeni sətir yaratmır. Lot bölgüsü yalnız rəsmi olaraq mövcud olduqda tətbiq olunur: layihə lotlara bölünübsə, hər lot öz `source_lot`, öz başlığı və (verilibsə) öz son tarixi ilə ayrıca imkan olur.

**Arxivləşdirmə:** mövcud Faza 1 məntiqi dəyişmədən işləyir — son tarixi keçən hər şey avtomatik `archived` olur və aktiv siyahılarda görünmür.

### Mənbələrarası təkrar (SIMAP ↔ TED)

WTO həddindən yuxarı İsveçrə tenderləri **həm SIMAP-da, həm TED-də** dərc olunur. Canlı yoxlamada 21 imkandan **13-ü** TED istinadı daşıyırdı. SIMAP detal cavabı rəsmi TED linkini verir; ondan TED elan nömrəsi çıxarılır və `crossSourceRefs`-də saxlanılır. Həmin tender TED-dən artıq yazılıbsa, SIMAP nüsxəsi **yaradılmır** və icra qeydinə say kimi düşür.

Bu birtərəflidir: TED planlaşdırılmış işdə birinci işlədiyi üçün adi halda düzgün nəticə verir. Məhdudiyyət 6-cı bölmədə qeyd olunub.

---

## 4. Terminologiya və qiymətləndirmə davranışı

Mövcud Raul taksonomiyası və qiymətləndirmə modeli saxlanıldı; yalnız çoxdillilik genişləndirildi və iki real yanlış-müsbət düzəldildi.

### Əlavə olunan terminologiya

* **Fransız:** `planificateur général`, `planification générale`, `mandataire général`, `architecte`, `conception architecturale`, `prestations d'architecte`, `groupe scolaire`, `collège`, `centre culturel`, `mandats d'étude parallèles`, `concours de projets`, `aménagement paysager`
* **İtalyan:** `progettista generale`, `pianificazione generale`, `architetto`, `progettazione architettonica`, `concorso di architettura`, `mandati di studio paralleli`, `architettura del paesaggio`, `architettura d'interni`, `centro culturale`, `scuola`
* **İsveçrəyə xas alman:** `Studienauftrag` (İsveçrə hüququnda müsabiqələr çox vaxt "Wettbewerb" deyil, "study contract" kimi keçir), `Projektwettbewerb`, `Gesamtleistungswettbewerb`, `Generalplanersubmission`, `Schulhaus`, `Schulanlage`, `Ausbildungszentrum`

### Termin uyğunlaşdırma düzəlişi (mövcud səhv)

`matchesTerm` axtarılan mətni normallaşdırırdı, amma **terminin özünü yox**. Normallaşdırma apostrofu boşluğa çevirdiyi üçün `services d'architecture`, `maîtrise d'oeuvre`, `concours d'architecture` kimi mövcud fransız terminləri **heç vaxt uyğun gəlmirdi**. İndi termin də eyni normallaşdırmadan keçir — bu, Faza 1-dəki fransız terminlərini də işlək edir.

### BIM təlimi istisnası

Yeni `training_courses` qaydası: CPV 80 (təhsil və təlim xidmətləri) və `BIM-Schulung`, `Weiterbildung`, `Fortbildung`, `formation continue`, `corso di formazione` kimi terminlər. Bu qayda `absolute` işarəlidir — yəni memarlıq CPV kodu olsa belə istisna edir, çünki təlim sifarişi sifarişçinin hansı CPV kodu yazmasından asılı olmayaraq memarlıq işi deyil. (Digər sərt qaydalar güclü memarlıq sübutu qarşısında yumşalır; bu qayda yumşalmır.)

### İki ayrı mətn sahəsi — canlı məlumatın aşkarladığı problem

Əvvəlcə rəsmi təsvir mətni bütün qiymətləndirməyə daxil edilmişdi. Canlı yoxlama göstərdi ki, bu **ən yaxşı İsveçrə imkanlarını basdırır**: İsveçrə memarlıq mandatının təsvirində yanaşı mühəndislik lotları (`ingénieur civil`, `chauffage ventilation`, `génie civil`) rutin olaraq adlanır və istisna qaydaları həmin sözlərə düşürdü. Nəticədə Cenevrədəki `GROUPE SCOLAIRE TIVOLI – PLANIFICATEUR GÉNÉRAL & ARCHITECTE` və Uster-dəki `Ausbildungszentrum Riedikon` istisna edilmişdi.

İndi iki ayrı sahə var:

* **İstisnalar** yalnız rəsmi başlıq + sifarişçi adını oxuyur — yəni tenderin *nə olduğunu*.
* **Təsnifat** (layihə tipi, xidmətlər, terminologiya) başlıq + sifarişçi + rəsmi təsviri oxuyur — yəni tenderin *nə haqqında olduğunu*.

Bu, TED davranışını hərfən dəyişməz saxlayır (TED sahə seçimində təsvir yoxdur), eyni zamanda alman/fransız/italyan elanlarının öz sözləri ilə təsnif olunmasına imkan verir.

### Memarlıq sübutunun genişləndirilməsi

İsveçrə sifarişçiləri memarlıq mandatını çox vaxt ümumi `71000000` kodu altında dərc edir; bu kod tək başına güclü sübut sayılmır (çəkisi 4). Nəticədə başlığında açıq şəkildə "ARCHITECTE" yazan tender sərt qayda ilə istisna olunurdu. İndi **CPV sübutu və ya başlıqdakı əsas memarlıq terminologiyası** — hər ikisi sərt qaydanı tarazlayır. Belə hallarda tender istisna olunmur, sadəcə −8 cəza alır və görünən qalır.

### İsveçrənin prioriteti dəyişməyib

`CHE` çəkisi əvvəlki kimi **14**-dür (DEU 14, AUT 9, digər Avropa 7) və Advanced → Uyğunluq profilində redaktə edilə bilər. Amma **İsveçrə olmaq tək başına yüksək bal vermir**: canlı yoxlamada 21 İsveçrə imkanının 11-i istisna edildi (yol, dəmiryol, geodeziya), qalanları isə 27–63 aralığında bal aldı. Xidmət uyğunluğu, layihə tipi, son tarix, miqyas və risklər son balı müəyyən etməyə davam edir. Fransız və italyan elanları dil amilindən −6 alır, çünki profil hazırda yalnız `de`/`en` təqdimat dillərini göstərir — bu, real məhdudiyyətin dürüst əksidir.

---

## 5. Əl ilə quraşdırma tələbləri

1. **Supabase SQL Editor-də `supabase/patch-business-radar-simap.sql` faylını icra edin.** (Əvvəlcə `patch-business-radar.sql` icra olunmalıdır.) Patch additivdir və təkrar icraya təhlükəsizdir.
2. Başqa heç nə tələb olunmur:
   * Yeni environment dəyişəni **yoxdur**
   * Yeni API açarı və ya sirr **yoxdur**
   * Yeni ödənişli xidmət və ya email provayderi **yoxdur**
   * Cron cədvəli dəyişməyib — `vercel.json`-dakı mövcud gündəlik iş indi hər iki mənbəni işlədir
3. İstəsəniz Advanced → Mənbələr bölməsindən SIMAP-ı söndürüb-yandıra bilərsiniz. Söndürülmüş mənbə planlaşdırılmış işdə sadəcə buraxılır, xəta kimi qeyd olunmur.

---

## 6. Testlər və nəticələr

| Yoxlama | Nəticə |
|---|---|
| `npm run lint` | **Keçdi** — 0 xəta. 1 xəbərdarlıq `src/lib/cms/public-lists.ts` faylındadır və bu işdən əvvəl də mövcud idi (toxunulmayıb). |
| `npx tsc --noEmit` | **Keçdi** — 0 xəta |
| `npm run build` | **Keçdi** — 356 səhifə. Bütün `/admin/radar/*` marşrutları dinamikdir, sitemap-da deyil. |
| `npx tsx scripts/radar-selftest.mts` | **25/25 keçdi** (9 TED + 16 SIMAP) |

### Yeni SIMAP yoxlamaları (hamısı şəbəkəsiz, fixture üzərində)

Rəsmi axtarış sorğusunun düzgün qurulması · detalların rəsmi endpoint-dən oxunması · 5 layihə + 1 lot bölgüsündən 6 imkan · rəsmi SIMAP linkinin qorunması · təkrarlanma açarının layihə nömrəsi olması · son tarixin detal cavabından oxunması · kanton/şəhərin saxlanması · **müqavilə dəyərinin uydurulmaması** · TED istinadının saxlanması · lotların öz son tarixi ilə ayrılması · alman Generalplaner elanının güclü bal alması · **fransız terminologiyasının tanınması** · **italyan müsabiqə terminologiyasının tanınması** · yol mühəndisliyinin istisna edilməsi · **BIM təliminin memarlıq CPV-si olsa belə istisna edilməsi** · **İsveçrə olmağın tək başına yüksək bal verməməsi**.

### Canlı yoxlama (yalnız oxuma, bazaya heç nə yazılmadı)

Real API üzərində bir dəfəlik smoke test icra edildi (30 günlük pəncərə, 1 səhifə): 20 layihə oxundu, 21 imkana çevrildi (biri 2 lotlu), **bad-url = 0**, **son tarixi olmayan = 0**, 13 TED istinadı. Nəticələr gözlənildiyi kimi ayrıldı — Zürich/Embrach Generalplaner mandatları və Ticino `progettista generale` elanı görünən, N13/dəmiryol/lazer-skan işləri isə istisna. Bu test müvəqqəti skript ilə aparıldı və **skript silindi**; **heç bir saxta və ya real production sətri yaradılmadı.**

---

## 7. Təxirə salınanlar və məlum məhdudiyyətlər

* **`advance_notice` elanları oxunmur.** Onlarda son tarix isteğe bağlıdır; hazırda yalnız təklif verilə bilən `tender`, `competition`, `study_contract` tipləri oxunur. Erkən xəbərdarlıq istənilsə, sonrakı mərhələdə əlavə oluna bilər.
* **Award elanları oxunmur** (bitmiş prosedurlar). Müqavilə dəyəri yalnız orada dərc olunduğu üçün SIMAP imkanlarında dəyər həmişə boş qalır.
* **Mənbələrarası təkrar yoxlaması birtərəflidir.** SIMAP TED-ə güzəşt edir. Əgər bir tender əvvəlcə SIMAP-dan yazılıb, sonra TED-də dərc olunsa, iki sətir görünə bilər. Sabit vəziyyətdə TED birinci işlədiyi üçün bu nadir haldır.
* **Kanton filtri Advanced-də açıq deyil.** API `orderAddressCantons` dəstəkləyir; hazırda bütün İsveçrə oxunur.
* **Detal sorğu limiti (60) və eyni-anda sorğu sayı (4) kod sabitidir**, ayar deyil. Advanced ayarlarına çıxarılması asandır.
* **`past-publications` endpoint-i istifadə olunmur.** Düzəliş tarixçəsi lazım olsa, sonrakı mərhələdə əlavə edilə bilər; hazırda düzəliş sadəcə mövcud sətri yeniləyir.
* **Cron `maxDuration` 60 saniyədir.** İki mənbə + 60 detal sorğusu bu limitə rahat sığır, amma SIMAP həcmi ciddi artarsa limit nəzərdən keçirilməlidir.
* **İctimai saytın `robots.txt`-i `/admin`-i qadağan etmir** (Faza 1-dən qalma). Praktikada risk yoxdur: admin marşrutları autentifikasiya tələb edir və hamısı `noindex, nofollow` göndərir. Bu iş çərçivəsində ictimai çıxışa toxunulmadı.

---

## 8. Təhlükəsizlik

* Bütün Radar məlumatı `is_staff()` RLS siyasəti altındadır; anon giriş yoxdur.
* Bütün `/admin/radar/*` səhifələri `robots: { index: false, follow: false }` göndərir və sitemap-a düşmür.
* Cron marşrutu `CRON_SECRET` ilə qorunur (timing-safe müqayisə) və `X-Robots-Tag: noindex` göndərir.
* SIMAP sorğuları yalnız serverdə icra olunur. SIMAP public endpoint-lərində sirr yoxdur, ona görə saxlanılacaq yeni sirr də yaradılmadı.

---

Commit, push və deploy edilmədi.
