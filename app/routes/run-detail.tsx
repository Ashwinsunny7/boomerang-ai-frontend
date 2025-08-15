import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Runs } from "../lib/api";
import type { Run, RunLog } from "../lib/types";
import { getSocket } from "../lib/ws";
import { formatDateTime } from "../lib/format";

export default function RunDetail() {
    const { runId } = useParams();
    const [run, setRun] = useState<Run | null>(null);
    const [logs, setLogs] = useState<RunLog[]>([]);

    useEffect(() => {
        if (!runId) return;
        Runs.get(runId).then(setRun);
        Runs.logs(runId).then(setLogs);

        const s = getSocket();
        s.emit("join", { runId });
        const onMsg = (msg: any) => {
            if (msg?.runId !== runId) return;
            if (msg?.type === "log") setLogs((prev) => prev.concat(msg.payload));
            if (msg?.type === "run:status") setRun((r) => (r ? { ...r, status: msg.payload.status } : r));
        };
        s.on("message", onMsg);
        return () => {
            s.off("message", onMsg);
            s.emit("leave", { runId });
        };
    }, [runId]);

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold text-white">Run {runId}</h1>
            {run && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="text-sm">Workflow: <span className="font-medium text-white">{run.workflowId}</span></div>
                    <div className="text-sm">Status: <span className="font-medium text-white">{run.status}</span></div>
                    <div className="text-sm">Started: {formatDateTime(run.startedAt)}</div>
                    {run.finishedAt && <div className="text-sm">Finished: {new Date(run.finishedAt).toLocaleString()}</div>}
                </div>
            )}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="font-medium mb-2 text-white">Logs</div>
                <div className="max-h-[60vh] overflow-auto text-sm space-y-1">
                    {logs.map((l) => (
                        <div key={l.id} className="grid grid-cols-[140px,100px,1fr] gap-2">
                            <div className="text-slate-400">{new Date(l.ts).toLocaleTimeString()}</div>
                            <div className="text-slate-300">{l.nodeId ?? "-"}</div>
                            <div><span className="mr-2 uppercase text-xs text-slate-400">{l.level}</span><span className="text-slate-100">{l.message}</span></div>
                        </div>
                    ))}
                    {logs.length === 0 && <div className="text-slate-400">No logs yet…</div>}
                </div>
            </div>
        </div>
    );
}