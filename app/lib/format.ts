// app/lib/format.ts
export function formatDateTime(value: string | null | undefined): string {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString(); // or toISOString(), or any formatting you prefer
}
