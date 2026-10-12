"use client";

import { useId, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routes";
import { submitInquiry } from "@/lib/actions/inquiry";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import type { BusinessStatus } from "@/lib/business-status";

export function QuoteForm({
  locale,
  dict,
  businessStatus,
}: {
  locale: Locale;
  dict: Dictionary;
  businessStatus: BusinessStatus;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [knives, setKnives] = useState("");
  const [frequency, setFrequency] = useState("");
  const [address, setAddress] = useState("");
  const [needsPickup, setNeedsPickup] = useState(false);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const consentId = useId();

  function clearError(name: string) {
    setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (businessName.trim().length < 2) next.businessName = dict.business.errors.businessName;
    if (contactName.trim().length < 2) next.contactName = dict.business.errors.contactName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = dict.business.errors.email;
    if (phone.trim() && phone.trim().length < 6) next.phone = dict.business.errors.phone;
    if (!businessType) next.businessType = dict.business.errors.businessType;
    const knifeCount = Number(knives.trim());
    if (!knives.trim() || !Number.isInteger(knifeCount) || knifeCount < 1 || knifeCount > 5000) {
      next.knives = dict.business.errors.knives;
    }
    if (!frequency) next.frequency = dict.business.errors.frequency;
    if (address.trim().length < 2) next.address = dict.business.errors.address;
    if (!consent) next.consent = dict.booking.contact.consentRequired;
    return next;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const next = validate();
    setFieldErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    const result = await submitInquiry({
      locale,
      businessName: businessName.trim(),
      businessType,
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      estimatedKnives: Number(knives.trim()),
      frequency,
      needsPickup,
      address: address.trim(),
      message: message.trim() || null,
      consent: true as const,
      website: "",
    });
    setPending(false);
    if (!result.ok) {
      setError(
        result.error === "rate"
          ? dict.business.errors.rate
          : result.error === "paused"
            ? dict.business.errors.paused
            : result.error === "save"
              ? dict.business.errors.save
              : dict.business.errors.submit,
      );
      return;
    }
    setReference(result.reference);
  }

  if (reference) {
    return (
      <div role="status">
        <p className="kicker">{dict.business.success.reference}</p>
        <p className="mt-4 font-serif text-[2.4rem] leading-none tracking-[-0.03em] text-ink">{reference}</p>
        <h3 className="mt-6 font-serif text-2xl text-ink sm:text-3xl">{dict.business.success.title}</h3>
        <p className="mt-4 max-w-md text-[16px] leading-relaxed text-stone">{dict.business.success.text}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-x-12 gap-y-8 md:grid-cols-2" noValidate>
      <Field
        label={dict.business.fields.businessName}
        value={businessName}
        onChange={(v) => {
          setBusinessName(v);
          clearError("businessName");
        }}
        autoComplete="organization"
        error={fieldErrors.businessName}
        required
      />
      <Field
        label={dict.business.fields.contactName}
        value={contactName}
        onChange={(v) => {
          setContactName(v);
          clearError("contactName");
        }}
        autoComplete="name"
        error={fieldErrors.contactName}
        required
      />
      <Field
        label={dict.business.fields.email}
        value={email}
        onChange={(v) => {
          setEmail(v);
          clearError("email");
        }}
        type="email"
        autoComplete="email"
        error={fieldErrors.email}
        required
      />
      <Field
        label={`${dict.business.fields.phone} (${dict.common.optional})`}
        value={phone}
        onChange={(v) => {
          setPhone(v);
          clearError("phone");
        }}
        type="tel"
        autoComplete="tel"
        error={fieldErrors.phone}
      />
      <SelectField
        label={dict.business.fields.businessType}
        value={businessType}
        onChange={(v) => {
          setBusinessType(v);
          clearError("businessType");
        }}
        options={dict.business.fields.businessTypes}
        placeholder={dict.business.fields.selectType}
        required
        error={fieldErrors.businessType}
      />
      <Field
        label={dict.business.fields.knives}
        value={knives}
        onChange={(v) => {
          setKnives(v.replace(/[^\d]/g, ""));
          clearError("knives");
        }}
        inputMode="numeric"
        pattern="[0-9]*"
        error={fieldErrors.knives}
        required
      />
      <SelectField
        label={dict.business.fields.frequency}
        value={frequency}
        onChange={(v) => {
          setFrequency(v);
          clearError("frequency");
        }}
        options={dict.business.fields.frequencies}
        placeholder={dict.business.fields.frequency}
        required
        error={fieldErrors.frequency}
      />
      <Field
        label={dict.business.fields.address}
        value={address}
        onChange={(v) => {
          setAddress(v);
          clearError("address");
        }}
        error={fieldErrors.address}
        required
      />
      <label className="flex items-start gap-3 text-[14px] leading-relaxed text-ink md:col-span-2">
        <input
          type="checkbox"
          className="form-check"
          checked={needsPickup}
          onChange={(e) => setNeedsPickup(e.currentTarget.checked)}
        />
        <span>{dict.business.fields.needsPickup}</span>
      </label>
      <p className="sr-only">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <label className="md:col-span-2">
        <span className="form-label">
          {dict.business.fields.message} ({dict.common.optional})
        </span>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={dict.business.fields.messagePlaceholder}
          className="form-input mt-2 min-h-[7.5rem] resize-y"
        />
      </label>

      <div className="md:col-span-2">
        <label htmlFor={consentId} className="flex items-start gap-3 text-[14px] leading-relaxed text-ink">
          <input
            id={consentId}
            type="checkbox"
            className="form-check"
            checked={consent}
            onChange={(e) => {
              setConsent(e.currentTarget.checked);
              clearError("consent");
            }}
          />
          <span>
            {businessStatus === "PRELAUNCH" ? dict.mode.consent : dict.booking.contact.consent}{" "}
            <Link href={localizedPath(locale, "privacy")} className="underline decoration-ink/35 underline-offset-[0.18em] hover:decoration-ink">
              {dict.booking.contact.consentLink}
            </Link>
            .
          </span>
        </label>
        {fieldErrors.consent && (
          <p className="mt-2 text-[13px] text-ember" role="alert">
            {fieldErrors.consent}
          </p>
        )}
      </div>

      {error && (
        <p className="md:col-span-2 text-[14px] text-ember" role="alert">
          {error}
        </p>
      )}

      <div className="md:col-span-2 pt-2">
        <Button type="submit" size="lg" disabled={pending} className="min-w-[12.5rem] px-8">
          {pending ? dict.common.submitting : dict.business.formSubmit}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  error,
  required,
  inputMode,
  pattern,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        required={required}
        inputMode={inputMode}
        pattern={pattern}
        onChange={(e) => onChange(e.target.value)}
        className="form-input mt-2"
        aria-invalid={Boolean(error)}
      />
      {error && (
        <p className="mt-2 text-[13px] text-ember" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
