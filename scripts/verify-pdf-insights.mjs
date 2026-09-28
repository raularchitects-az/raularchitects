import { readFileSync, writeFileSync } from 'node:fs';

const rows = JSON.parse(readFileSync('content/insights-2026-09/rows.json', 'utf8'));
const locales = ['az', 'en', 'de', 'ru'];
const origin = 'https://www.raularchitects.com';
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)]));
const results = [];
for (const row of rows) {
  const checks = await Promise.all(locales.map(async locale => {
    const copy = row.translations[locale];
    const url = `${origin}/${locale}/insights/${copy.slug}`;
    const response = await fetch(url, { headers: { 'user-agent': 'Googlebot' }, signal: AbortSignal.timeout(45000) });
    const html = await response.text();
    const metas = [...html.matchAll(/<meta\s[^>]*>/g)].map(([tag]) => attributes(tag));
    const links = [...html.matchAll(/<link\s[^>]*>/g)].map(([tag]) => attributes(tag));
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(([, json]) => JSON.parse(json));
    const schema = schemas.find(item => item['@type'] === 'Article');
    const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
    const issues = [];
    const check = (ok, label) => { if (!ok) issues.push(label); };
    check(response.status === 200, `HTTP ${response.status}`);
    check(title === copy.seoTitle, 'title');
    check(metas.some(item => item.name === 'description' && item.content === copy.description), 'description');
    check(links.some(item => item.rel === 'canonical' && item.href === url), 'canonical');
    for (const alternate of locales) check(links.some(item => item.hrefLang === alternate || item.hreflang === alternate) && links.some(item => (item.hrefLang === alternate || item.hreflang === alternate) && item.href === `${origin}/${alternate}/insights/${row.translations[alternate].slug}`), `hreflang ${alternate}`);
    check(links.some(item => (item.hrefLang === 'x-default' || item.hreflang === 'x-default') && item.href === `${origin}/az/insights/${row.slug}`), 'x-default');
    check(metas.some(item => item.name === 'robots' && item.content.includes('index') && !item.content.includes('noindex')), 'indexable');
    check(metas.some(item => item.property === 'og:type' && item.content === 'article'), 'OG type');
    check(metas.some(item => item.name === 'twitter:card' && item.content === 'summary_large_image'), 'Twitter card');
    check((html.match(/<h1\b/g) || []).length === 1 && html.includes(copy.title), 'single H1');
    check(schema?.headline === copy.title && schema?.inLanguage === locale && schema?.url === url, 'Article schema');
    check(schema?.datePublished === '2026-09-28', 'publication date');
    check(html.includes(copy.imageAlt), 'image alt');
    check(html.includes(copy.ctaLabel), 'localized CTA');
    for (const [, target] of copy.body.matchAll(/\]\(\/insights\/([^)]+)\)/g)) {
      check(html.includes(`href="/${locale}/insights/${target}"`), `rendered related link ${target}`);
    }
    const headings = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map(([, value]) => decode(value));
    check(headings.length >= 5 && headings.every(value => value.length < 120 && !value.includes('\n')), 'separate heading blocks');
    const image = metas.find(item => item.property === 'og:image')?.content;
    check(Boolean(image?.includes('/storage/v1/object/public/media/insights/pdf-series-2026-09/')), 'social image');
    return { url, status: response.status, title, image, issues };
  }));
  results.push(...checks);
  console.log(`${row.slug}: ${checks.every(item => !item.issues.length) ? 'PASS (4 locales)' : JSON.stringify(checks.filter(item => item.issues.length))}`);
}
const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
const sitemap = await sitemapResponse.text();
const missingSitemap = results.filter(item => !sitemap.includes(`<loc>${item.url}</loc>`)).map(item => item.url);
const indexes = await Promise.all(locales.map(async locale => {
  const response = await fetch(`${origin}/${locale}/insights`);
  const html = await response.text();
  return { locale, status: response.status, missing: rows.filter(row => !html.includes(`/${locale}/insights/${row.translations[locale].slug}`)).map(row => row.slug) };
}));
const images = await Promise.all([...new Set(results.map(item => item.image).filter(Boolean))].map(async url => {
  const response = await fetch(url);
  return { url, status: response.status, type: response.headers.get('content-type') };
}));
const report = { checkedAt: new Date().toISOString(), pages: results, indexes, sitemap: { status: sitemapResponse.status, missing: missingSitemap }, images };
writeFileSync('content/insights-2026-09/verification.json', JSON.stringify(report, null, 2) + '\n');
const failed = results.some(item => item.issues.length) || missingSitemap.length || indexes.some(item => item.status !== 200 || item.missing.length) || images.some(item => item.status !== 200 || !item.type?.includes('image/webp'));
console.log(JSON.stringify({ checked: results.length, failedPages: results.filter(item => item.issues.length).length, missingSitemap: missingSitemap.length, indexes, images: images.length, passed: !failed }, null, 2));
if (failed) process.exitCode = 1;
