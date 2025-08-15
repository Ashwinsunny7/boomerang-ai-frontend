// app/components/ui/Stat.tsx
import { Link } from "react-router";

export function Stat({ label, value, hint, href }: { label: string; value: React.ReactNode; hint?: string; href?: string }) {
    const inner = (
        <div className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow transition-colors hover:bg-slate-900">
            <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
            <div className="mt-1 text-5xl font-semibold text-white">{value}</div>
            {hint ? <div className="mt-1 text-xs text-slate-400">{hint}</div> : null}
        </div>
    );
    return href ? <Link to={href}>{inner}</Link> : inner;
}