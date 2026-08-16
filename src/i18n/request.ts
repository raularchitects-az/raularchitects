import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "./routing";
import az from "../../messages/az.json";
import en from "../../messages/en.json";
import ru from "../../messages/ru.json";
import de from "../../messages/de.json";

const messagesByLocale = { az, en, ru, de } as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: messagesByLocale[locale as Locale],
  };
});
