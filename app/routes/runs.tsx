import { useQuery } from "@tanstack/react-query";
import { Runs } from "../lib/api";
import { Link } from "react-router";
import { formatDateTime } from "../lib/format";

export default function RunsList() {
    const { data, isLoading, isError, error } = useQuery({ queryKey: ["runs"], queryFn: () => Runs.list() });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-white">Recent Runs</h1>
            </div>
            {isLoading && <div className="text-slate-300">Loading…</div>}
            {isError && <div className="text-rose-400">Error: {(error as any)?.message}</div>}

            <div className="grid gap-2 mb-12">
                {(data ?? []).map((r) => (
                    <Link key={r.id} to={`/runs/${r.id}`} className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 flex items-center justify-between hover:bg-slate-900">
                        <div>
                            <div className="font-medium text-white">{r.workflowId}</div>
                            <div className="text-xs text-slate-400">{formatDateTime(r.startedAt)}</div>
                        </div>
                        <div className="text-xs rounded px-2 py-1 border border-slate-700 text-slate-200">{r.status}</div>
                    </Link>
                ))}
                {(!data || data.length === 0) && <div className="text-sm text-slate-400">No runs yet.</div>}
            </div>
        </div>
    );
}