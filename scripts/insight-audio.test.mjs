import assert from "node:assert/strict";
import test from "node:test";
import { buildInsightBriefText, insightBriefHash, INSIGHT_BRIEF_TARGET_CHARS } from "./insight-audio-text.mjs";

test("insight brief stays near the one-minute char target", () => {
  const body = `Büdcə aşımı nadir hallarda tək səhvə bağlıdır.

## 1. Qeyri-müəyyən brif
Hədəf aydın olmadıqda layihə yenidən dizayn döngüsünə düşür.

## 2. Zəif risk ehtiyatı
Erkən smeta ilə icra arasında boşluq böyükdürsə ehtiyatlar tükənir.

## 3. Koordinasiya boşluqları
Memarlıq və mühəndislik eyni cədvəldə görüşməyəndə sahədə düzəlişlər artır.

## 4. Satınalma uyğunsuzluğu
Bazar qiymətləri dəyişəndə sabit seçimlər bahalaşa bilər.

## 5. Zəif dəyişiklik idarəetməsi
Təsdiqsiz dəyişikliklər büdcəni səssizcə aşır.`;

  const text = buildInsightBriefText(
    "Böyük layihələrdə büdcə niyə aşılır?",
    "Büdcə aşımı adətən bəxtsizlik deyil.",
    body,
    "az",
  );
  assert.match(text, /Böyük layihələrdə/);
  assert.match(text, /brif|ehtiyat|Koordinasiya/i);
  assert.ok(text.length >= 400, `too short: ${text.length}`);
  assert.ok(text.length <= INSIGHT_BRIEF_TARGET_CHARS.az + 160, `too long: ${text.length}`);
});

test("insight brief hash is versioned and stable", () => {
  const a = insightBriefHash("salam");
  const b = insightBriefHash("salam");
  assert.equal(a, b);
  assert.notEqual(a, insightBriefHash("salam."));
});
