// app/components/ui/Card.tsx
import type { ReactNode } from "react";

export function Card({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow">
            <div className="mb-3">
                <h2 className="text-base font-semibold text-white">{title}</h2>
                {description ? <p className="text-sm text-slate-300">{description}</p> : null}
            </div>
            <div className="text-slate-200">{children}</div>
        </div>
    );
}