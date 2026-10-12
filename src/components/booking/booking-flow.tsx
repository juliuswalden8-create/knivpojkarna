"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routes";
import type { PublicPackage } from "@/lib/pricing";
import { formatPrice, interpolate } from "@/lib/utils";
import { isDateAvailable, monthGrid, parseTimeSlots, parseWeekdays } from "@/lib/dates";
import { submitBooking } from "@/lib/actions/booking";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { cn } from "@/lib/utils";
import type { BusinessStatus } from "@/lib/business-status";
import { AREA_OTHER_IN_CORRIDOR, AREA_OUTSIDE } from "@/lib/service-area";
import {
  calculateDeliveryQuote,
  resolveDeliveryLocation,
  type DeliveryFeeSettings,
} from "@/lib/delivery-zones";

type Props = {
  locale: Locale;
  dict: Dictionary;
  packages: PublicPackage[];
  initialSlug?: string;
  extraKnifePriceCents: number;
  singlePriceCents: number;
  openWeekdays: string;
  timeSlots: string;
  leadTimeDays: number;
  bookingWindowDays: number;
  blocked: string[];
  businessStatus: BusinessStatus;
  areas: { name: string }[];
  deliveryFees: DeliveryFeeSettings;
  pickupInstructions: string;
  returnInstructions: string;
};

const STEPS = 4;

export function BookingFlow(props: Props) {
  const { locale, dict, packages } = props;
  const router = useRouter();
  const initial = packages.find((p) => p.slug === props.initialSlug) ?? packages.find((p) => p.highlighted) ?? packages[0];
  const prelaunch = props.businessStatus === "PRELAUNCH";
  const stepLabels = [dict.booking.steps.package, dict.booking.steps.contact, dict.booking.steps.schedule, dict.booking.steps.review];

  const [step, setStep] = useState(0);
  const [packageId, setPackageId] = useState(initial?.id ?? "");
  const [areaName, setAreaName] = useState("");
  const [areaDetail, setAreaDetail] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupNotes, setPickupNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const pkg = packages.find((p) => p.id === packageId) ?? packages[0];
  const needsDetail = areaName === AREA_OTHER_IN_CORRIDOR || areaName === AREA_OUTSIDE;
  const outside = areaName === AREA_OUTSIDE;
  const showCalendar = !prelaunch && !outside;
  const availability = useMemo(
    () => ({
      openWeekdays: parseWeekdays(props.openWeekdays),
      timeSlots: parseTimeSlots(props.timeSlots),
      leadTimeDays: Math.max(1, props.leadTimeDays),
      bookingWindowDays: props.bookingWindowDays,
      blocked: props.blocked,
    }),
    [props],
  );

  const areaOptions = [
    ...props.areas.map((area) => ({ value: area.name, label: area.name })),
    { value: AREA_OTHER_IN_CORRIDOR, label: dict.booking.service.areaOther },
    { value: AREA_OUTSIDE, label: dict.booking.service.areaOutside },
  ];

  function next() {
    setError(null);
    setFieldError(null);
    if (step === 0 && !packageId) {
      setFieldError("package");
      return setError(dict.booking.errors.package);
    }
    if (step === 1) {
      if (name.trim().length < 2) {
        setFieldError("name");
        return setError(dict.booking.errors.name);
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError("email");
        return setError(dict.booking.errors.email);
      }
      if (phone.trim().length < 6) {
        setFieldError("phone");
        return setError(dict.booking.errors.phone);
      }
      if (addressLine.trim().length < 3) {
        setFieldError("address");
        return setError(dict.booking.errors.address);
      }
      if (postalCode.trim().length < 4) {
        setFieldError("postal");
        return setError(dict.booking.errors.postal);
      }
      if (!areaName.trim() || (needsDetail && !areaDetail.trim())) {
        setFieldError("area");
        return setError(dict.booking.errors.area);
      }
      if (!consent) return setError(dict.booking.contact.consentRequired);
    }
    if (step === 2 && showCalendar && !preferredDate) {
      setFieldError("date");
      return setError(dict.booking.schedule.selectDate);
    }
    setStep((s) => Math.min(s + 1, STEPS - 1));
  }

  async function submit() {
    if (pending) return;
    setError(null);
    setPending(true);
    const result = await submitBooking({
      locale,
      packageId,
      serviceType: "PICKUP",
      addressLine,
      postalCode,
      areaName,
      areaDetail: needsDetail ? areaDetail : null,
      preferredDate: showCalendar ? preferredDate : null,
      preferredTimeSlot: showCalendar ? preferredTimeSlot || null : null,
      customerName: name,
      email,
      phone,
      pickupNotes: pickupNotes || null,
      comments: null,
      consent: true as const,
      website: "",
    });
    if (!result.ok) {
      setPending(false);
      setError(
        dict.booking.errors[result.error as keyof typeof dict.booking.errors] ||
          (result.error === "save" ? dict.booking.errors.save : dict.common.unknownError),
      );
      return;
    }
    router.push(`${localizedPath(locale, "book")}/success?ref=${encodeURIComponent(result.reference)}`);
  }

  const townLabel =
    areaName === AREA_OTHER_IN_CORRIDOR || areaName === AREA_OUTSIDE ? areaDetail || dict.booking.service.areaOutside : areaName;
  const location = resolveDeliveryLocation({
    areaName,
    areaDetail: needsDetail ? areaDetail : null,
    addressLine,
    postalCode,
  });
  const quote = pkg ? calculateDeliveryQuote(pkg.priceCents, location, props.deliveryFees) : null;
  const feeLabel = quote
    ? quote.deliveryFeeWaived
      ? interpolate(dict.booking.review.deliveryFree, { threshold: formatPrice(props.deliveryFees.freeThresholdCents, locale) })
      : quote.deliveryNeedsReview
        ? dict.booking.review.deliveryReview
        : !quote.inServiceArea
          ? dict.booking.review.deliveryOutside
          : quote.deliveryFeeCents == null
            ? dict.booking.review.feeUnconfigured
            : `${formatPrice(quote.deliveryFeeCents, locale)} · ${dict.booking.review.deliveryRoundtrip}`
    : dict.booking.review.feeUnconfigured;

  return (
    <div className="border-t border-line pt-8">
      <ol className="mb-10 hidden gap-4 sm:grid sm:grid-cols-4">
        {stepLabels.map((label, i) => (
          <li key={label} className={cn("border-t pt-3 text-[12px]", i <= step ? "border-ink text-ink" : "border-line text-stone")}>
            {label}
          </li>
        ))}
      </ol>
      <p className="mb-6 text-[12px] text-stone sm:hidden">
        {interpolate(dict.booking.stepOf, { current: step + 1, total: STEPS })}
      </p>

      {step === 0 && (
        <fieldset>
          <legend className="font-serif text-3xl">{dict.booking.package.title}</legend>
          <p className="mt-2 text-sm text-stone">{dict.booking.package.text}</p>
          <div className="mt-6 grid gap-3">
            {packages.map((p) => (
              <label
                key={p.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 border-b border-line py-5",
                  packageId === p.id ? "text-ink" : "text-stone hover:text-ink",
                )}
              >
                <span>
                  <input type="radio" className="sr-only" name="package" checked={packageId === p.id} onChange={() => setPackageId(p.id)} />
                  <span className="font-serif text-xl text-ink">{p.name}</span>
                  <span className="mt-1 block text-xs text-stone">
                    {p.knifeCount === 1
                      ? dict.booking.package.includesOne
                      : interpolate(dict.booking.package.includesMany, { n: p.knifeCount })}
                  </span>
                </span>
                <span className="font-serif text-2xl text-ink">{formatPrice(p.priceCents, locale)}</span>
              </label>
            ))}
          </div>
          {pkg && (
            <p className="mt-6 text-sm text-stone">
              {dict.booking.package.selected}:{" "}
              <strong className="text-ink">
                {pkg.name} · {formatPrice(pkg.priceCents, locale)}
              </strong>
            </p>
          )}
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="grid gap-4">
          <legend className="font-serif text-3xl">{dict.booking.contact.title}</legend>
          <Field
            label={dict.booking.contact.name}
            value={name}
            onChange={setName}
            autoComplete="name"
            required
            invalid={fieldError === "name"}
          />
          <Field
            label={dict.booking.contact.email}
            value={email}
            onChange={setEmail}
            type="email"
            autoComplete="email"
            required
            invalid={fieldError === "email"}
          />
          <Field
            label={dict.booking.contact.phone}
            value={phone}
            onChange={setPhone}
            type="tel"
            autoComplete="tel"
            required
            invalid={fieldError === "phone"}
          />
          <Field
            label={dict.booking.service.addressLine}
            value={addressLine}
            onChange={setAddressLine}
            autoComplete="street-address"
            placeholder={dict.booking.service.addressPlaceholder}
            required
            invalid={fieldError === "address"}
          />
          <Field
            label={dict.booking.service.postalCode}
            value={postalCode}
            onChange={setPostalCode}
            autoComplete="postal-code"
            required
            invalid={fieldError === "postal"}
          />
          <SelectField
            label={dict.booking.service.area}
            value={areaName}
            onChange={setAreaName}
            placeholder={dict.booking.service.areaPlaceholder}
            options={areaOptions}
            required
            error={fieldError === "area" ? dict.booking.errors.area : undefined}
          />
          {needsDetail && (
            <Field
              label={dict.booking.service.areaDetail}
              value={areaDetail}
              onChange={setAreaDetail}
              placeholder={dict.booking.service.areaDetailPlaceholder}
              required
              invalid={fieldError === "area"}
            />
          )}
          <label>
            <span className="kicker">
              {dict.booking.service.instructions} ({dict.common.optional})
            </span>
            <textarea
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              rows={3}
              placeholder={dict.booking.service.instructionsPlaceholder}
              className="field mt-2"
            />
          </label>
          {outside && <p className="text-sm text-stone">{dict.booking.service.outsideNotice}</p>}
          <label className="flex items-start gap-3 text-sm text-stone">
            <input type="checkbox" className="mt-1 accent-forest" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              {prelaunch ? dict.mode.consent : dict.booking.contact.consent}{" "}
              <a href={localizedPath(locale, "privacy")} className="text-ink underline">
                {dict.booking.contact.consentLink}
              </a>
              .
            </span>
          </label>
          <p className="sr-only">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </p>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset>
          <legend className="font-serif text-3xl">
            {prelaunch ? dict.booking.schedule.prelaunchTitle : dict.booking.schedule.title}
          </legend>
          <p className="mt-2 text-sm text-stone">
            {prelaunch
              ? dict.booking.schedule.prelaunchText
              : outside
                ? dict.booking.service.outsideNotice
                : dict.booking.schedule.activeText}
          </p>
          {showCalendar && (
            <>
              <p className="mt-4 text-sm text-stone">{dict.booking.schedule.manualConfirm}</p>
              <p className="mt-1 text-sm text-stone">{dict.booking.schedule.noSameDay}</p>
              <div className="mt-6 flex items-center justify-between">
                <button type="button" className="text-sm text-stone hover:text-ink" onClick={() => setMonth(shiftMonth(month, -1))}>
                  {dict.booking.schedule.prevMonth}
                </button>
                <p className="text-sm">
                  {new Date(month.y, month.m, 1).toLocaleString(locale === "es" ? "es-ES" : "en-GB", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <button type="button" className="text-sm text-stone hover:text-ink" onClick={() => setMonth(shiftMonth(month, 1))}>
                  {dict.booking.schedule.nextMonth}
                </button>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-[0.12em] text-stone">
                {dict.booking.schedule.weekdays.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {monthGrid(month.y, month.m).map((cell, i) =>
                  cell ? (
                    <button
                      key={cell.iso}
                      type="button"
                      disabled={!isDateAvailable(cell.iso, availability)}
                      onClick={() => setPreferredDate(cell.iso)}
                      className={cn(
                        "h-10 text-sm disabled:opacity-25",
                        preferredDate === cell.iso ? "bg-forest text-soft" : "hover:bg-offwhite-200",
                      )}
                    >
                      {cell.date}
                    </button>
                  ) : (
                    <span key={`e-${i}`} />
                  ),
                )}
              </div>
              <p className="mt-6 text-sm text-stone">{dict.booking.schedule.timeOptional}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {availability.timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setPreferredTimeSlot((current) => (current === slot ? "" : slot))}
                    className={cn(
                      "border py-3 text-sm",
                      preferredTimeSlot === slot ? "border-ink bg-ink text-soft" : "border-line hover:border-ink",
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </>
          )}
          {props.pickupInstructions ? <p className="mt-6 text-sm text-stone">{props.pickupInstructions}</p> : null}
          {props.returnInstructions ? <p className="mt-2 text-sm text-stone">{props.returnInstructions}</p> : null}
        </fieldset>
      )}

      {step === 3 && pkg && (
        <div>
          <h2 className="font-serif text-3xl">{dict.booking.review.title}</h2>
          <dl className="mt-6 divide-y divide-line text-sm">
            <Row label={dict.booking.review.package} value={`${pkg.name} · ${formatPrice(pkg.priceCents, locale)}`} />
            <Row label={dict.booking.review.knives} value={String(pkg.knifeCount)} />
            <Row label={dict.booking.review.service} value={dict.booking.service.pickupReturn} />
            <Row label={dict.booking.review.town} value={townLabel} />
            {showCalendar ? (
              <Row
                label={dict.booking.review.schedule}
                value={preferredDate ? `${preferredDate}${preferredTimeSlot ? ` · ${preferredTimeSlot}` : ""}` : "—"}
              />
            ) : null}
            <Row label={dict.booking.review.subtotal} value={formatPrice(pkg.priceCents, locale)} />
            <Row label={dict.booking.review.fee} value={feeLabel} />
            <Row
              label={dict.booking.review.estimate}
              value={
                quote && quote.deliveryFeeCents != null
                  ? formatPrice(quote.estimatedTotalCents, locale)
                  : `${formatPrice(pkg.priceCents, locale)} + ${dict.booking.review.feeUnconfigured.toLowerCase()}`
              }
            />
            <Row label={dict.booking.review.contact} value={`${name} · ${email} · ${phone}`} />
            <Row
              label={dict.booking.review.status}
              value={
                prelaunch
                  ? dict.booking.review.statusPrelaunch
                  : outside
                    ? dict.booking.review.statusOutside
                    : dict.booking.review.statusActive
              }
            />
          </dl>
          <p className="mt-6 kicker">{dict.booking.review.estimate}</p>
          <p className="font-serif text-4xl">
            {quote && quote.deliveryFeeCents != null
              ? formatPrice(quote.estimatedTotalCents, locale)
              : formatPrice(pkg.priceCents, locale)}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-stone">
            {prelaunch ? dict.booking.review.interestNote : dict.booking.review.estimateNote}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-5 border border-ember/40 bg-orange-100 px-4 py-3 text-sm text-ember" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" disabled={pending} onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}>
          {dict.common.back}
        </Button>
        {step < STEPS - 1 ? (
          <Button type="button" onClick={next}>
            {dict.common.next}
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={pending}>
            {pending ? dict.common.submitting : prelaunch ? dict.mode.bookingSubmit : dict.booking.review.submit}
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  required,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
}) {
  return (
    <label>
      <span className="kicker">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
        className="field mt-2"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
      <dt className="text-stone">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function shiftMonth(month: { y: number; m: number }, delta: number) {
  const d = new Date(month.y, month.m + delta, 1);
  return { y: d.getFullYear(), m: d.getMonth() };
}
