// app/routes/workflows.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Workflows } from "../lib/api";
import { Link } from "react-router";

export default function WorkflowsIndex() {
    const qc = useQueryClient();
    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({ queryKey: ["workflows"], queryFn: Workflows.list });

    const del = useMutation({
        mutationFn: (id: string) => Workflows.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-white">Workflows</h1>
                <Link
                    to="/workflows/new"
                    className="rounded-lg bg-sky-500 text-white px-4 py-2 hover:bg-sky-400"
                >
                    New workflow
                </Link>
            </div>

            {isLoading && <div className="text-slate-300">Loading…</div>}
            {isError && (
                <div className="text-rose-400">Error: {(error as any)?.message}</div>
            )}

            <div className="grid gap-2">
                {(data ?? []).map((w) => (
                    <div
                        key={w.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 flex items-center justify-between hover:bg-slate-900"
                    >
                        <div>
                            <div className="font-medium text-white">{w.name}</div>
                            <div className="text-xs text-slate-400">{w.id}</div>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                to={`/workflows/${w.id}/edit`}
                                className="rounded-lg border border-slate-700 bg-slate-900 text-slate-100 px-3 py-1 hover:bg-slate-800"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            `Delete workflow “${w.name}” (${w.id})? This cannot be undone.`
                                        )
                                    ) {
                                        del.mutate(w.id);
                                    }
                                }}
                                disabled={del.isPending}
                                className="rounded-lg border border-slate-700 bg-slate-900 text-slate-100 px-3 py-1 hover:bg-slate-800 disabled:opacity-60"
                            >
                                {del.isPending ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                ))}
                {(!data || data.length === 0) && (
                    <div className="text-sm text-slate-400">No workflows yet.</div>
                )}
            </div>
        </div>
    );
}
