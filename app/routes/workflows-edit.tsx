import { useParams, useNavigate, useLocation } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Workflows } from "../lib/api";
import type { Workflow } from "../lib/types";
import { FlowEditor } from "../components/FlowEditor";

const EMPTY: Workflow = {
    id: "new-workflow",
    name: "New Workflow",
    description: null,
    graph: { nodes: [], edges: [] },
    triggerRule: null,
};

export default function WorkflowEdit() {
    const { id } = useParams();
    const isNew = useLocation().pathname.endsWith("/new");
    const navigate = useNavigate();
    const qc = useQueryClient();

    const { data } = useQuery({
        queryKey: ["workflow", id],
        queryFn: () => (isNew ? Promise.resolve(EMPTY) : Workflows.get(id!)),
        enabled: !!(isNew || id),
    });

    const [wf, setWf] = useState<Workflow>(data ?? EMPTY);
    useEffect(() => { if (data) setWf(data); }, [data]);

    const save = useMutation({
        mutationFn: async () => {
            if (isNew) return Workflows.create(wf);
            return Workflows.update(wf.id, wf);
        },
        onSuccess: (saved) => {
            qc.invalidateQueries({ queryKey: ["workflows"] });
            if (isNew) navigate(`/workflows/${saved.id}/edit`, { replace: true });
            alert("Saved");
        },
    });

    return (
        <div className="space-y-3">
            {/* <div className="flex items-center gap-2">
                <input className="rounded border px-3 py-2 font-medium"
                    value={wf.name} onChange={e => setWf({ ...wf, name: e.target.value })} />
                <button onClick={() => save.mutate()} className="rounded bg-black text-white px-3 py-2">Save Workflow</button>

                <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm">Trigger rule JSON</span>
                    <input className="w-[420px] rounded border px-3 py-2 text-sm"
                        placeholder='{"and":[{"==":[{"var":"lead.source"},"LinkedIn"]},{">":[{"var":"lead.score"},75]}]}'
                        value={wf.triggerRule ? JSON.stringify(wf.triggerRule) : ""}
                        onChange={(e) => {
                            try { setWf({ ...wf, triggerRule: e.target.value ? JSON.parse(e.target.value) : null }); }
                            catch {  }
                        }} />
                </div>
            </div> */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-600">ID</label>
                    <input
                        className="rounded border px-3 py-2 font-mono text-sm"
                        value={wf.id}
                        onChange={(e) => setWf({ ...wf, id: e.target.value.trim() })}
                        placeholder="lead-demo"
                    />
                </div>

                <input
                    className="rounded border px-3 py-2 font-medium"
                    value={wf.name}
                    onChange={(e) => setWf({ ...wf, name: e.target.value })}
                    placeholder="Lead Demo"
                />

                <button
                    onClick={() => save.mutate()}
                    className="rounded bg-black text-white px-3 py-2"
                >
                    Save Workflow
                </button>

                <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm">Trigger rule JSON</span>
                    <input
                        className="w-[420px] rounded border px-3 py-2 text-sm"
                        placeholder='{"and":[{"==":[{"var":"lead.source"},"LinkedIn"]},{">":[{"var":"lead.score"},75]}]}'
                        value={wf.triggerRule ? JSON.stringify(wf.triggerRule) : ""}
                        onChange={(e) => {
                            try {
                                setWf({ ...wf, triggerRule: e.target.value ? JSON.parse(e.target.value) : null });
                            } catch {
                                /* ignore while typing */
                            }
                        }}
                    />
                </div>
            </div>


            <FlowEditor value={wf} onChange={setWf} />
        </div>
    );
}
