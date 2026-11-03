import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import {
  buildSpeechText,
  chunkSpeechText,
  hasSpeechLocale,
  normalizeSpeechPronunciation,
  numberToAzWords,
  speechHash,
  splitLongSentences,
} from "./blog-audio-text.mjs";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function loadTypeScript(file) {
  const code = ts.transpileModule(read(file), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loadedModule = { exports: {} };
  new vm.Script(`(function(module,exports,require){${code}})`).runInThisContext()(
    loadedModule,
    loadedModule.exports,
    () => ({}),
  );
  return loadedModule.exports;
}

const audio = loadTypeScript("src/lib/blog/audio.ts");
const entry = {
  slug: "bim-memarliq-nedir",
  lang: "az",
  url: "https://example.supabase.co/storage/v1/object/public/blog-audio/bim-memarliq-nedir/az.mp3?v=abc",
  duration_seconds: 160.5,
  bytes: 1284717,
  hash: "abc",
  voice: "gemini-3.8-flash-tts:Kore",
  generated_at: "2026-11-03T10:00:00.000Z",
};

test("speech text strips links and markup and turns headings into sentences", () => {
  const text = buildSpeechText(
    "BIM memarlıq",
    "Qısa cavab\nModel [xidmətdən](/xidmetler/bim-ile-layihelendirme) asılıdır. Ətraflı: https://raularchitects.com/bloq\n\n## Nə daxildir\n- Koordinasiya\n- **Həcm** cədvəli",
  );
  assert.equal(
    text,
    "BIM memarlıq.\n\nQısa cavab.\nModel xidmətdən asılıdır. Ətraflı:\n\nNə daxildir.\nKoordinasiya.\nHəcm cədvəli.",
  );
  assert.doesNotMatch(text, /\]\(|https?:|\*\*|#/);
});

test("AZ speech expands years for correct TTS", () => {
  assert.equal(numberToAzWords(2026), "iki min iyirmi altı");
  assert.equal(numberToAzWords(300), "üç yüz");
  const text = normalizeSpeechPronunciation("Raul Architects layihələri 2026.", "az");
  assert.match(text, /Raul Architects/);
  assert.match(text, /iki min iyirmi altı/);
  assert.doesNotMatch(text, /\b2026\b/);
});

test("RU brand pronunciation", () => {
  assert.match(normalizeSpeechPronunciation("Raul Architects office", "ru"), /Раул Аркитектс/);
});

test("speech hash is stable and changes with the text", () => {
  assert.equal(speechHash("salam"), speechHash("salam"));
  assert.notEqual(speechHash("salam"), speechHash("salam."));
  assert.match(speechHash("salam"), /^[a-f0-9]{64}$/);
});

test("chunks stay under the byte limit and keep every word", () => {
  const paragraph = Array.from({ length: 40 }, (_, index) => `Это предложение номер ${index} о архитектуре.`).join(
    " ",
  );
  const text = [paragraph, paragraph, "Короткий абзац."].join("\n\n");
  const chunks = chunkSpeechText(text, 1200);
  assert.ok(chunks.length > 2);
  for (const chunk of chunks) assert.ok(Buffer.byteLength(chunk) <= 1200, `chunk too big: ${Buffer.byteLength(chunk)}`);
  assert.equal(chunks.join(" ").replace(/\s+/g, " "), text.replace(/\s+/g, " "));
});

test("long comma lists are split into shorter sentences", () => {
  const long = `Дополнительно: ${Array.from({ length: 8 }, (_, index) => `услуга ${index} для проекта`).join(", ")}.`;
  assert.equal(splitLongSentences("Коротко, ясно."), "Коротко, ясно.");
  assert.ok(splitLongSentences(long).split(". ").length >= 4);
});

test("audio only for real translations in CMS translations jsonb", () => {
  const post = {
    translations: {
      az: { title: "A", body: "B" },
      en: { title: "A", body: "B" },
      ru: { title: "Р", body: "Т" },
    },
  };
  assert.equal(hasSpeechLocale(post, "az"), true);
  assert.equal(hasSpeechLocale(post, "en"), false);
  assert.equal(hasSpeechLocale(post, "ru"), true);
});

test("manifest lookup, durations and AudioObject schema", () => {
  const manifest = { entries: [entry, { ...entry, lang: "ru", url: "http://insecure" }] };
  assert.deepEqual(audio.findBlogAudio(manifest, entry.slug, "az"), entry);
  assert.equal(audio.findBlogAudio(manifest, entry.slug, "ru"), null);
  assert.equal(audio.findBlogAudio(null, entry.slug, "az"), null);
  assert.equal(audio.findBlogAudio(manifest, "missing", "de"), null);
  assert.equal(audio.isoDuration(160.5), "PT2M41S");
  assert.equal(audio.isoDuration(120), "PT2M");
  assert.equal(audio.isoDuration(42), "PT42S");
  assert.equal(audio.formatAudioDuration(160.5), "2:41");
  const schema = audio.blogAudioSchema(entry, "BIM memarlıq");
  assert.deepEqual(schema, {
    "@type": "AudioObject",
    name: "BIM memarlıq",
    contentUrl: entry.url,
    encodingFormat: "audio/mpeg",
    duration: "PT2M41S",
    inLanguage: "az-AZ",
  });
});

test("audio generator selects CMS blog_posts and supports --all", () => {
  const source = read("scripts/generate-blog-audio.mjs");
  assert.match(source, /--all/);
  assert.match(source, /args\.all/);
  assert.match(source, /blog_posts/);
  assert.match(source, /translations/);
});

test("blog detail page renders player and AudioObject only when audio exists", () => {
  const source = read("src/app/[locale]/bloq/[slug]/page.tsx");
  assert.match(source, /getBlogAudio\(post\.slug, locale\)/);
  assert.match(source, /blogAudioSchema\(audio, copy\.title\)/);
  assert.match(source, /BlogAudioPlayer/);
  const player = read("src/components/blog-audio-player.tsx");
  assert.match(player, /<audio[\s\S]*controls[\s\S]*preload="none"/);
});
