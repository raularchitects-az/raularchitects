# Business Radar — Ölkə prioriteti düzəlişi (hesabat)

Bu hesabat yalnız Business Radar-ın **ölkə prioriteti məntiqinə** aid son düzəlişi əhatə edir. Kəşf mənbəyi, taksonomiya, digər qiymət amilləri, admin interfeysi, marşrutlar və ictimai sayt toxunulmayıb.

---

## 1. Nə baş verdi

Düzəliş iki addımda getdi və son vəziyyət ikinci addımdır.

**Addım 1 — ölkə prioriteti tamamilə çıxarıldı.** İlk tapşırıq "Almaniya və İsveçrə hard-code edilməməlidir" idi, ona görə `countryPriorities` boşaldıldı və bütün Avropa ölkələri bərabər çəki aldı.

**Addım 2 — geri qaytarıldı və ölçüləndirildi (cari vəziyyət).** İkinci tapşırıqla Almaniya və İsveçrə yenidən default ən yüksək prioritet oldu, lakin üstünlük "moderate" olmalı və digər Avropa ölkələrinin güclü imkanlarını basdırmamalı idi. Ona görə prioritet bərpa edildi, amma aralarındakı fərq orijinaldan dar saxlanıldı.

---

## 2. Yekun məntiq

| Ölkə | Çəki | Əvvəlki (orijinal) | Addım 1 |
|---|---|---|---|
| Almaniya (DEU) | **14** | 15 | 0 (siyahı boş idi) |
| İsveçrə (CHE) | **14** | 15 | 0 |
| Avstriya (AUT) | **9** | 8 | 0 |
| Digər uyğun Avropa ölkələri | **7** | 4 | 10 (hamı bərabər) |

Ölkə amilinin ümumi limiti dəyişməyib: **maksimum 16 xal**.

### Niyə 14/14/9/7, orijinal 15/15/8/4 deyil

Orijinal quruluşda Almaniya ilə digər Avropa arasında **11 xal** fərq var idi. 100 ballıq şkalada qiymət bantlarının sərhədləri 15 xal aralıqdadır (70 → 85), yəni ölkə amili təkbaşına bir imkanı demək olar ki, tam bir bant yuxarı-aşağı ata bilirdi. Bu, "unfairly bury" tələbinə ziddir.

Yeni quruluşda fərq **7 xaldır** — bir banddan kiçik. Almaniya və İsveçrə hələ də aydın şəkildə ən yüksək prioritetdədir, amma bərabərhüquqlu yarışda güclü fransız və ya italyan tenderi zəif alman tenderini üstələyə bilir.

Digər Avropa ölkələrinin çəkisi 4-dən 7-yə qaldırıldı ki, prioritet olmayan ölkələr "az xal alan" deyil, "bir qədər az xal alan" mövqedə qalsın.

### Niyə Avstriya 9-dur, 10 deyil

Bu, koddakı bir sərhəd səbəbindəndir və qəsdən seçilib. `isPriorityCountry()` funksiyası çəkisi **10 və yuxarı** olan ölkəni "əsas bazar" sayır və bu status iki şeyi söndürür:

* `-4` xallıq **"Yerli ofis/partnyor tələbi aydın deyil"** amilini,
* analizdəki **"Yerli uyğunluğu yoxla"** (`check_local_eligibility`) tövsiyəsini.

Avstriyaya 10 versəydik, o, təsadüfən əsas bazar statusu alar və yerli uyğunluq sualı ümumiyyətlə qaldırılmazdı. 9 çəkisi ilə Avstriya kiçik üstünlük alır, lakin yerli mövcudluq məsələsi hələ də risk kimi göstərilir — bu, orijinal davranışla (AUT 8 idi) eynidir.

---

## 3. Kəşf mərhələsi — dəyişməyib

TED kəşfi **bütün Avropaya açıqdır** və heç vaxt DEU/CHE ilə məhdudlaşdırılmır:

* `DEFAULT_SEARCH.countryFilter` boş massivdir (`[]`).
* `buildTedQuery()` `buyer-country IN (...)` şərtini **yalnız** siyahı doldurulduqda əlavə edir.

Beləliklə default sorğu yalnız CPV ailələri və dərc tarixi aralığı üzərində qurulur; coğrafi prioritet tamamilə qiymətləndirmə mərhələsində tətbiq olunur. Heç bir ölkənin elanı mənbə səviyyəsində atılmır.

Advanced səhifəsindəki "Ölkə filtri" sahəsindən `DEU CHE` placeholder mətni silinib, çünki həmin sahə məhz kəşfi məhdudlaşdırır və orada belə bir təklifin qalması yanıltıcı olardı. Sahənin etiketi formatı onsuz da izah edir: `Ölkə filtri (ISO3, boş = hamısı)`.

---

## 4. Bərpa olunan davranış

Prioritet siyahısı yenidən dolu olduğu üçün bütün orijinal davranış geri qayıdıb:

| Yer | Davranış |
|---|---|
| Qiymət amili etiketi | `Ölkə prioriteti: DEU` |
| Analiz — DEU/CHE | «Almaniya Raul üçün prioritet bazardır» |
| Analiz — AUT və digərləri | «... ikinci dərəcəli prioritetdir» |
| Yerli mövcudluq cəzası (−4) | Yalnız prioritet olmayan ölkələrə |
| `check_local_eligibility` tövsiyəsi | Yalnız prioritet olmayan ölkələrə |

---

## 5. Redaktə imkanı

Ölkə prioritetləri **Admin → Business Radar → Advanced → Raul uyğunluq profili → Ölkə prioritetləri** sahəsində redaktə olunur. Format hər sətirdə bir giriş:

```
DEU:Almaniya:14
CHE:İsveçrə:14
AUT:Avstriya:9
```

Siyahıda olmayan bütün ölkələr **"Digər Avropa çəkisi"** sahəsindəki dəyəri alır (default 7).

Kodda saxlanılan bir qoruyucu var: əgər kimsə siyahını tamamilə boşaldarsa, sistem heç bir ölkəni digərindən üstün tutmur və yerli uyğunluq cəzasını hamıya tətbiq etmir. Bu olmasaydı, boş siyahı halında **bütün** kartlar eyni cəzanı və eyni «Yerli uyğunluğu yoxla» tövsiyəsini göstərərdi, yəni tövsiyə sahəsi tamamilə mənasızlaşardı. Default vəziyyətdə (siyahı dolu) bu qoruyucu heç vaxt işə düşmür və davranışa təsir etmir.

---

## 6. Qiymətə təsiri

Aşağıdakı rəqəmlər sabit TED nümunə cavabı (`ted-search-response.json`) üzərində **əl ilə hesablanıb** — bu turda yalnız lint və TypeScript yoxlaması işlədildi, self-check skripti işlədilmədi. Təsdiq üçün `npx tsx scripts/radar-selftest.mts` və ya Advanced səhifəsindəki **«Mənbə testini işlət»** düyməsi kifayətdir.

| Nümunə elan | Orijinal | Addım 1 | **Cari** |
|---|---|---|---|
| Almaniya memarlıq müsabiqəsi (DEU) | 100 / excellent | 95 / excellent | **99 / excellent** |
| İsveçrə Generalplanung + BIM (CHE) | 84 / potential | 79 / potential | **83 / potential** |
| Yol və körpü mühəndisliyi (DEU) | istisna | istisna | **istisna** |
| BIM proqram təminatı alışı (POL) | istisna | istisna | **istisna** |

İstisna qaydaları ölkədən asılı deyil, ona görə dəyişməyib.

### "Basdırılmama" yoxlaması

Eyni alman müsabiqəsi elanının **yalnız ölkə kodu** prioritet olmayan bir Avropa ölkəsinə dəyişsəydi (dil eyni qalmaqla), xal belə olardı:

```
99  −7 (ölkə çəkisi 14 → 7)
    −4 (yerli ofis/partnyor tələbi aydın deyil)
    −2 (bir əlavə naməlum məlumat cəzası)
 = 86 / excellent
```

Yəni prioritet olmayan ölkədəki eyni güclü imkan hələ də **ən yüksək banddadır**. Ölkə prioriteti sıralamaya təsir edir, amma güclü imkanı gizlətmir.

---

## 7. Dəyişən fayllar

| Fayl | Dəyişiklik |
|---|---|
| `src/lib/radar/eligibility.ts` | `DEFAULT_ELIGIBILITY.countryPriorities` bərpa edildi (DEU 14, CHE 14, AUT 9), `otherEuropeWeight` 7. `hasCountryPreferences()` köməkçi funksiyası. Sənədləşdirmə şərhləri. |
| `src/lib/radar/scoring.ts` | Ölkə amili etiketi prioritet siyahısının vəziyyətinə görə seçilir; yerli mövcudluq cəzası eyni şərtə bağlandı. Digər amillər toxunulmadı. |
| `src/lib/radar/analysis.ts` | `whyItMatters` və tövsiyə məntiqi eyni şərtə bağlandı. İcazə verilən tövsiyə siyahısı dəyişməyib. |
| `src/lib/radar/taxonomy.ts` | Yalnız şərh mətni — alman terminologiyasının niyə zəngin olduğunu izah edən sətir. Terminlər, CPV ailələri və istisnalar toxunulmayıb. |
| `src/app/admin/(panel)/radar/advanced/page.tsx` | Ölkə filtri sahəsindən `DEU CHE` placeholder-i silindi. Başqa dəyişiklik yoxdur. |
| `RAUL_BUSINESS_RADAR_PHASE1_REPORT.md` | Qiymət cədvəlindəki köhnəlmiş ölkə çəkiləri sətri yeniləndi. |

Migrasiya, cədvəl, marşrut, server action, taksonomiya məzmunu, e-poçt məntiqi və ictimai sayt **dəyişməyib**.

---

## 8. Yoxlama

| Əmr | Nəticə |
|---|---|
| `npx tsc --noEmit` | Keçdi, 0 xəta. |
| `npm run lint` | Keçdi, 0 xəta, 1 xəbərdarlıq — `src/lib/cms/public-lists.ts` faylında əvvəldən mövcud olan istifadə edilməmiş import, bu işlə əlaqəsi yoxdur. |

`npm run build` və self-check skripti bu turda işlədilmədi, çünki tapşırıqda yalnız lint və TypeScript yoxlaması istənilmişdi.

Commit, push və deploy edilməyib.

---

## 9. Açıq qalan bir qərar

Addım 1-də lisenziya məhdudiyyəti mətni alman termininə xüsusi istinaddan ümumi formaya çevrilmişdi və hələ də ümumi formadadır:

* İndiki: «Yerli memarlıq palatası/lisenziya qeydiyyatı heç bir ölkə üzrə təsdiqlənməyib.»
* Orijinal: «Yerli memarlıq palatası (Architektenkammer) qeydiyyatı təsdiqlənməyib.»

Bu mətn hər kartda risk siyahısında görünür. Ümumi variant bütün ölkələr üçün düzgün oxunur; orijinal variant isə əsas bazar Almaniya olduğu üçün daha konkretdir. Bu, ölkə prioriteti deyil, profil məzmunudur və Advanced Settings-dən redaktə oluna bilər. Hansını istəsəniz, təyin edə bilərik.
