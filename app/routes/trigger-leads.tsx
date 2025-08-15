import { useState } from "react";
import { Events } from "../lib/api";

export default function TriggerLeads() {
    const [json, setJson] = useState<string>(
        JSON.stringify({ lead: { source: "LinkedIn", score: 92, name: "Anita", email: "a@ex.com", title: "CEO" } }, null, 2)
    );
    const [out, setOut] = useState<any>(null);

    const send = async () => {
        try {
            const payload = JSON.parse(json);
            const res = await Events.ingestLead(payload);
            setOut(res);
        } catch (e: any) {
            setOut({ error: String(e?.message || e) });
        }
    };

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold text-white">Trigger Tester – Leads</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="text-sm font-medium mb-1 text-white">Payload</div>
                    <textarea className="w-full h-[60vh] rounded-lg border border-slate-700 bg-slate-900 text-slate-100 p-2 font-mono text-sm" value={json} onChange={(e) => setJson(e.target.value)} />
                </div>
                <div>
                    <div className="text-sm font-medium mb-1 text-white">Response</div>
                    <pre className="w-full h-[60vh] rounded-lg border border-slate-700 bg-slate-900 text-slate-100 p-2 text-sm overflow-auto">{JSON.stringify(out, null, 2)}</pre>
                </div>
            </div>
            <button onClick={send} className="rounded-lg bg-sky-500 text-white px-4 py-2 hover:bg-sky-400">Send</button>
        </div>
    );
}