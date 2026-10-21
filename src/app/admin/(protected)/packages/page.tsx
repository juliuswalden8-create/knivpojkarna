import type { InputHTMLAttributes } from "react";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/utils";
import { savePackage } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Packages | BladeBud", robots: { index: false } };

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-serif text-3xl">Packages</h1>
      <p className="mt-1 text-sm text-stone">Prices are stored in euros. Extra feature lines are one per line.</p>
      <div className="mt-8 grid gap-6">
        {packages.map((pkg) => (
          <form key={pkg.id} action={savePackage} className="grid gap-3 border border-line p-5 md:grid-cols-2">
            <input type="hidden" name="id" value={pkg.id} />
            <Field name="nameEn" label="Name EN" defaultValue={pkg.nameEn} />
            <Field name="nameEs" label="Name ES" defaultValue={pkg.nameEs} />
            <Field name="nameSv" label="Name SV" defaultValue={pkg.nameSv ?? ""} />
            <Field name="price" label="Price (€)" type="number" step="0.01" defaultValue={(pkg.priceCents / 100).toString()} />
            <Field name="knifeCount" label="Knives included" type="number" defaultValue={String(pkg.knifeCount)} />
            <Field name="sortOrder" label="Sort" type="number" defaultValue={String(pkg.sortOrder)} />
            <label className="md:col-span-2">
              <span className="kicker">Features EN</span>
              <textarea name="featuresEn" rows={3} defaultValue={parseJsonArray(pkg.featuresEn).join("\n")} className="field mt-2" />
            </label>
            <label className="md:col-span-2">
              <span className="kicker">Features ES</span>
              <textarea name="featuresEs" rows={3} defaultValue={parseJsonArray(pkg.featuresEs).join("\n")} className="field mt-2" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="highlighted" defaultChecked={pkg.highlighted} className="accent-forest" /> Most popular
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={pkg.active} className="accent-forest" /> Active
            </label>
            <div className="md:col-span-2">
              <Button type="submit" size="sm">
                Save {pkg.slug}
              </Button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}

function Field(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label>
      <span className="kicker">{label}</span>
      <input {...rest} className="field mt-2" />
    </label>
  );
}
