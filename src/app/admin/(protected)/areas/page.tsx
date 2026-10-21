import type { InputHTMLAttributes } from "react";
import { prisma } from "@/lib/prisma";
import { saveArea } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Service areas | BladeBud", robots: { index: false } };

export default async function AreasAdminPage() {
  const areas = await prisma.serviceArea.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-serif text-3xl">Service areas</h1>
      <div className="mt-8 grid gap-6">
        {areas.map((area) => (
          <form key={area.id} action={saveArea} className="grid gap-3 border border-line p-5 md:grid-cols-2">
            <input type="hidden" name="id" value={area.id} />
            <Field name="name" label="Name" defaultValue={area.name} />
            <Field name="sortOrder" label="Sort" type="number" defaultValue={String(area.sortOrder)} />
            <Field name="mapX" label="Map X %" type="number" step="0.1" defaultValue={String(area.mapX)} />
            <Field name="mapY" label="Map Y %" type="number" step="0.1" defaultValue={String(area.mapY)} />
            <label className="md:col-span-2">
              <span className="kicker">Description EN</span>
              <textarea name="descriptionEn" rows={2} defaultValue={area.descriptionEn} className="field mt-2" />
            </label>
            <label className="md:col-span-2">
              <span className="kicker">Description ES</span>
              <textarea name="descriptionEs" rows={2} defaultValue={area.descriptionEs} className="field mt-2" />
            </label>
            <label>
              <span className="kicker">Pickup</span>
              <select name="pickupStatus" defaultValue={area.pickupStatus} className="field mt-2">
                <option value="ON_REQUEST">On request</option>
                <option value="PICKUP_AVAILABLE">Pickup available</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={area.active} className="accent-forest" /> Active
            </label>
            <div className="md:col-span-2">
              <Button type="submit" size="sm">
                Save {area.name}
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
