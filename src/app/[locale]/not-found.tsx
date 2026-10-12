import { defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedPath } from "@/i18n/routes";
import { ButtonLink } from "@/components/ui/button";

export default function LocaleNotFound() {
  const dict = getDictionary(defaultLocale);
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-start justify-center py-24">
      <p className="kicker">{dict.notFound.kicker}</p>
      <h1 className="display mt-4 text-4xl sm:text-5xl">{dict.notFound.title}</h1>
      <p className="mt-4 text-stone">{dict.notFound.text}</p>
      <ButtonLink href={localizedPath(defaultLocale, "home")} className="mt-8">
        {dict.notFound.home}
      </ButtonLink>
    </div>
  );
}
