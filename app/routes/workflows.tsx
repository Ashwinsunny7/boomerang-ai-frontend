import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Workflows } from "../lib/api";
import { Link } from "react-router";

export default function WorkflowsIndex() {
    const qc = useQueryClient();
    const { data, isLoading, isError, error } = useQuery({ queryKey: ["workflows"], queryFn: Workflows.list });

    const del = useMutation({
        mutationFn: (id: string) => Workflows.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
    });

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Workflows</h1>
                <Link to="/workflows/new" className="rounded bg-black text-white px-3 py-2">New workflow</Link>
            </div>

            {isLoading && <div>Loading…</div>}
            {isError && <div className="text-red-600">Error: {(error as any)?.message}</div>}

            <div className="grid gap-2">
                {(data ?? []).map(w => (
                    <div key={w.id} className="rounded border bg-white px-3 py-2 flex items-center justify-between">
                        <div>
                            <div className="font-medium">{w.name}</div>
                            <div className="text-xs text-neutral-500">{w.id}</div>
                        </div>
                        <div className="flex gap-2">
                            <Link to={`/workflows/${w.id}/edit`} className="rounded border px-3 py-1">Edit</Link>
                            <button onClick={() => del.mutate(w.id)} className="rounded border px-3 py-1">Delete</button>
                        </div>
                    </div>
                ))}
                {(!data || data.length === 0) && <div className="text-sm text-neutral-500">No workflows yet.</div>}
            </div>
        </div>
    );
}
