import { Button } from "@/components/ui/button";

export function InquiryFilters({
  action,
  statusOptions,
  values,
  sortOptions,
}: {
  action: string;
  statusOptions: { value: string; label: string }[];
  values: { q?: string; status?: string; from?: string; to?: string; sort?: string };
  sortOptions?: { value: string; label: string }[];
}) {
  return (
    <form action={action} className="mt-6 grid gap-3 border border-line p-4 sm:grid-cols-2 lg:grid-cols-6">
      <label>
        <span className="kicker">Search</span>
        <input name="q" defaultValue={values.q ?? ""} placeholder="Name, email, phone, address" className="field mt-2" />
      </label>
      <label>
        <span className="kicker">Status</span>
        <select name="status" defaultValue={values.status ?? ""} className="field mt-2">
          <option value="">All</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="kicker">From</span>
        <input type="date" name="from" defaultValue={values.from ?? ""} className="field mt-2" />
      </label>
      <label>
        <span className="kicker">To</span>
        <input type="date" name="to" defaultValue={values.to ?? ""} className="field mt-2" />
      </label>
      {sortOptions ? (
        <label>
          <span className="kicker">Sort</span>
          <select name="sort" defaultValue={values.sort ?? "newest"} className="field mt-2">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="flex items-end">
        <Button type="submit" size="sm">
          Filter
        </Button>
      </div>
    </form>
  );
}
