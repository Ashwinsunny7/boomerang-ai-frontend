// app/routes/actions-new.tsx
import { useState } from "react";
import { Actions } from "../lib/api";

const EXAMPLE = `{
  "key": "SLACK_POST",
  "name": "Slack: Post Message",
  "executor": "HTTP",
  "schemaJson": {
    "type": "object",
    "required": ["method", "url", "bodyTemplate"],
    "properties": {
      "method": { "enum": ["POST"] },
      "url": { "type": "string", "format": "uri" },
      "headers": { "type": "object", "additionalProperties": { "type":"string" } },
      "bodyTemplate": { "type": "string" }
    }
  },
  "uiSchemaJson": { "bodyTemplate": { "ui:widget": "textarea" } },
  "defaultsJson": {
    "method": "POST",
    "url": "https://httpbin.org/post",
    "bodyTemplate": "{\\"msg\\": \\"Lead {{lead.name}} qualified\\"}"
  }
}`;

export default function ActionsNew() {
    const [text, setText] = useState(EXAMPLE);
    const [busy, setBusy] = useState(false);

    const create = async () => {
        setBusy(true);
        try {
            const payload = JSON.parse(text);
            await Actions.create(payload);
            alert("Action created ✅. Go to /workflows/new and you’ll see it under Dynamic (Catalog).");
        } catch (e: any) {
            alert(`Failed: ${e?.message ?? e}`);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-3">
            <h1 className="text-xl font-semibold">Create ActionKind (Dynamic Node)</h1>
            <p className="text-sm text-neutral-600">
                Paste a JSON payload. The <code>key</code> becomes <code>node.type</code>. The <code>schemaJson</code> is a JSON
                Schema used to render the config form in the editor.
            </p>

            <textarea
                className="w-full h-80 rounded border px-3 py-2 font-mono text-sm"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <div className="flex gap-2">
                <button
                    onClick={create}
                    disabled={busy}
                    className="rounded bg-black text-white px-3 py-2 disabled:opacity-60"
                >
                    {busy ? "Creating..." : "Create"}
                </button>
                <button
                    type="button"
                    className="rounded border px-3 py-2"
                    onClick={() => setText(EXAMPLE)}
                >
                    Reset example
                </button>
            </div>
        </div>
    );
}
