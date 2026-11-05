"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routes";
import { submitWaitlist } from "@/lib/actions/waitlist";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { AREA_OTHER_IN_CORRIDOR, AREA_OUTSIDE } from "@/lib/service-area";

type Props = {
  locale: Locale;
  dict: Dictionary;
  areas: { name: string }[];
};

export function WaitlistForm({ locale, dict, areas }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [areaName, setAreaName] = useState("");
  const [areaDetail, setAreaDetail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const needsDetail = areaName === AREA_OTHER_IN_CORRIDOR || areaName === AREA_OUTSIDE;
  const areaOptions = [
    ...areas.map((area) => ({ value: area.name, label: area.name })),
    { value: AREA_OTHER_IN_CORRIDOR, label: dict.booking.service.areaOther },
    { value: AREA_OUTSIDE, label: dict.booking.service.areaOutside },
  ];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setFieldError(null);

    if (name.trim().length < 2) {
      setFieldError("name");
      return setError(dict.booking.errors.name);
    }
    const hasEmail = email.trim().length > 0;
    const hasPhone = phone.trim().length > 0;
    if (!hasEmail && !hasPhone) {
      setFieldError("contact");
      return setError(dict.waitlist.errors.contact);
    }
    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldError("email");
      return setError(dict.booking.errors.email);
    }
    if (hasPhone && phone.trim().length < 6) {
      setFieldError("phone");
      return setError(dict.booking.errors.phone);
    }
    if (!areaName.trim() || (needsDetail && !areaDetail.trim())) {
      setFieldError("area");
      return setError(dict.booking.errors.area);
    }
    if (!consent) return setError(dict.booking.contact.consentRequired);

    setPending(true);
    const result = await submitWaitlist({
      locale,
      customerName: name,
      email: hasEmail ? email : null,
      phone: hasPhone ? phone : null,
      areaName,
      areaDetail: needsDetail ? areaDetail : null,
      consent: true as const,
      website: "",
    });
    if (!result.ok) {
      setPending(false);
      setError(
        dict.booking.errors[result.error as keyof typeof dict.booking.errors] ||
          (result.error === "contact" ? dict.waitlist.errors.contact : dict.common.unknownError),
      );
      return;
    }
    router.push(`${localizedPath(locale, "book")}/success?ref=${encodeURIComponent(result.reference)}`);
  }

  return (
    <form onSubmit={submit} className="border-t border-line pt-8" noValidate>
      <fieldset className="grid gap-5">
        <legend className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
          {dict.waitlist.formTitle}
        </legend>
        <p className="text-sm leading-relaxed text-stone">{dict.waitlist.formText}</p>

        <label>
          <span className="kicker">{dict.booking.contact.name}</span>
          <input
            type="text"
            value={name}
            autoComplete="name"
            required
            aria-invalid={fieldError === "name" || undefined}
            onChange={(e) => setName(e.target.value)}
            className="form-input mt-2"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            <span className="kicker">{dict.waitlist.emailLabel}</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              aria-invalid={fieldError === "email" || fieldError === "contact" || undefined}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input mt-2"
              placeholder={dict.waitlist.emailPlaceholder}
            />
          </label>
          <label>
            <span className="kicker">{dict.waitlist.whatsappLabel}</span>
            <input
              type="tel"
              value={phone}
              autoComplete="tel"
              aria-invalid={fieldError === "phone" || fieldError === "contact" || undefined}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input mt-2"
              placeholder={dict.waitlist.whatsappPlaceholder}
            />
          </label>
        </div>
        <p className="text-[13px] leading-relaxed text-stone">{dict.waitlist.contactHint}</p>

        <SelectField
          label={dict.booking.service.area}
          value={areaName}
          onChange={setAreaName}
          placeholder={dict.booking.service.areaPlaceholder}
          options={areaOptions}
          required
          error={fieldError === "area" ? dict.booking.errors.area : undefined}
        />
        {needsDetail ? (
          <label>
            <span className="kicker">{dict.booking.service.areaDetail}</span>
            <input
              type="text"
              value={areaDetail}
              required
              aria-invalid={fieldError === "area" || undefined}
              placeholder={dict.booking.service.areaDetailPlaceholder}
              onChange={(e) => setAreaDetail(e.target.value)}
              className="form-input mt-2"
            />
          </label>
        ) : null}

        <label className="flex items-start gap-3 text-sm text-stone">
          <input
            type="checkbox"
            className="form-check"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            {dict.mode.consent}{" "}
            <a href={localizedPath(locale, "privacy")} className="text-ink underline">
              {dict.booking.contact.consentLink}
            </a>
            .
          </span>
        </label>

        <p className="sr-only" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </p>
      </fieldset>

      {error ? (
        <p className="mt-5 border border-ember/40 bg-orange-100 px-4 py-3 text-sm text-ember" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8">
        <Button type="submit" disabled={pending} className="h-auto min-h-12 w-full px-7 py-3 sm:w-auto">
          {pending ? dict.common.submitting : dict.mode.bookingSubmit}
        </Button>
      </div>
    </form>
  );
}
