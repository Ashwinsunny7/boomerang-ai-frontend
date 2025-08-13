import { useQuery } from "@tanstack/react-query";
import { Runs } from "../lib/api";
import { Link } from "react-router";

export default function RunsList() {
    const { data, isLoading, isError, error } = useQuery({ queryKey: ["runs"], queryFn: () => Runs.list() });

    return (
        <div className="space-y-3">
            <h1 className="text-xl font-semibold">Recent Runs</h1>
            {isLoading && <div>Loading…</div>}
            {isError && <div className="text-red-600">Error: {(error as any)?.message}</div>}

            <div className="grid gap-2">
                {(data ?? []).map(r => (
                    <Link key={r.id} to={`/runs/${r.id}`} className="rounded border bg-white px-3 py-2 flex items-center justify-between">
                        <div>
                            <div className="font-medium">{r.workflowId}</div>
                            <div className="text-xs text-neutral-500">{new Date(r.startedAt).toLocaleString()}</div>
                        </div>
                        <div className="text-xs rounded px-2 py-1 border">{r.status}</div>
                    </Link>
                ))}
                {(!data || data.length === 0) && <div className="text-sm text-neutral-500">No runs yet.</div>}
            </div>
        </div>
    );
}
