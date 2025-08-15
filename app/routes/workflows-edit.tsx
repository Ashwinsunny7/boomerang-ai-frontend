import { useParams, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Workflows } from "../lib/api";
import type { Workflow } from "../lib/types";
import { FlowEditor } from "../components/FlowEditor";

const EMPTY: Workflow = { id: "new-workflow", name: "New Workflow", description: null, graph: { nodes: [], edges: [] }, triggerRule: null };

export default function WorkflowEdit() {
    const { id } = useParams();
    const isNew = useLocation().pathname.endsWith("/new");
    const navigate = useNavigate();
    const qc = useQueryClient();

    const { data } = useQuery({ queryKey: ["workflow", id], queryFn: () => (isNew ? Promise.resolve(EMPTY) : Workflows.get(id!)), enabled: !!(isNew || id) });

    const [wf, setWf] = useState<Workflow>(data ?? EMPTY);
    useEffect(() => { if (data) setWf(data); }, [data]);

    const save = useMutation({
        mutationFn: async () => { if (isNew) return Workflows.create(wf); return Workflows.update(wf.id, wf); },
        onSuccess: (saved) => { qc.invalidateQueries({ queryKey: ["workflows"] }); if (isNew) navigate(`/workflows/${saved.id}/edit`, { replace: true }); alert("Saved"); },
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-300">ID</label>
                    <input className="rounded border border-slate-700 bg-slate-900 text-slate-100 px-3 py-2 font-mono text-sm" value={wf.id} onChange={(e) => setWf({ ...wf, id: e.target.value.trim() })} placeholder="lead-demo" />
                </div>
                <input className="rounded border border-slate-700 bg-slate-900 text-slate-100 px-3 py-2 font-medium" value={wf.name} onChange={(e) => setWf({ ...wf, name: e.target.value })} placeholder="Lead Demo" />
                <button onClick={() => save.mutate()} className="rounded-lg bg-sky-500 text-white px-3 py-2 hover:bg-sky-400">Save Workflow</button>
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-slate-300">Trigger rule JSON</span>
                    <input className="w-[420px] max-w-full rounded border border-slate-700 bg-slate-900 text-slate-100 px-3 py-2 text-sm" placeholder='{"and":[{"==":[{"var":"lead.source"},"LinkedIn"]},{">":[{"var":"lead.score"},75]}]}' value={wf.triggerRule ? JSON.stringify(wf.triggerRule) : ""} onChange={(e) => { try { setWf({ ...wf, triggerRule: e.target.value ? JSON.parse(e.target.value) : null }); } catch { } }} />
                </div>
            </div>

            <FlowEditor value={wf} onChange={setWf} />
        </div>
    );
}