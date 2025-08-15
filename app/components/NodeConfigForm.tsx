import { useEffect } from "react";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { NodeType } from "../lib/types";

// We validate only these fields with RHF/Zod
type FormValues = { name: string; config: any };

// Base + per-type schemas (all resolve to FormValues)
const num0 = z.preprocess((v) => {
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const n = Number(v as any);
    return Number.isFinite(n) ? n : 0;
}, z.number().int().min(0));

const base = z.object({ name: z.string().min(1, "Required") });

const cfgByType: Record<NodeType, z.ZodType<FormValues>> = {
    NOTIFY: base.extend({
        config: z.object({
            channel: z.enum(["console", "email", "slack"]).default("console"),
            msg: z.string().min(1),
        }),
    }),
    // WAIT: base.extend({
    //     config: z
    //         .object({
    //             seconds: z.number().int().positive().optional(),
    //             minutes: z.number().int().positive().optional(),
    //             hours: z.number().int().positive().optional(),
    //         })
    //         .refine((v) => v.seconds || v.minutes || v.hours, {
    //             message: "Provide a delay",
    //         }),
    // }),
    WAIT: base.extend({
        config: z
            .object({
                seconds: num0.optional(),
                minutes: num0.optional(),
                hours: num0.optional(),
            })
            .refine((v) => {
                const s = v.seconds ?? 0;
                const m = v.minutes ?? 0;
                const h = v.hours ?? 0;
                return s + m + h > 0;
            }, { message: "Set at least one non-zero duration (seconds/minutes/hours)." }),
    }),
    EMAIL: base.extend({
        config: z.object({
            to: z.string().min(3),
            subject: z.string().min(1),
            body: z.string().min(1),
        }),
    }),
    IF: base.extend({
        config: z.object({ rule: z.any() }),
    }),
    API_CALL: base.extend({
        config: z.object({
            method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("POST"),
            url: z.string().url(),
            // explicit key+value types for TS
            headers: z.record(z.string(), z.string()).optional(),
            bodyTemplate: z.string().optional(),
            timeoutMs: z.number().int().positive().optional(),
        }),
    }),
};

export type NodeFormData = { type: NodeType } & FormValues;

export function NodeConfigForm(props: {
    type: NodeType;
    initial: NodeFormData;
    onSubmit: (v: NodeFormData) => void;
}) {
    // keep this untyped so inference works
    const schema = cfgByType[props.type];

    // Minimal manual resolver using Zod
    const resolver: Resolver<FormValues> = async (values) => {
        const parsed = schema.safeParse(values);
        if (parsed.success) return { values: parsed.data, errors: {} };

        // map Zod issues to RHF's FieldErrors (simple flat mapping)
        const errors: Record<string, any> = {};
        for (const issue of parsed.error.issues) {
            const key = issue.path.join(".") || "root";
            errors[key] = { type: "validation", message: issue.message };
        }
        return { values: {}, errors };
    };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver,
        defaultValues: { name: props.initial.name, config: props.initial.config },
    });

    useEffect(() => {
        reset({ name: props.initial.name, config: props.initial.config });
    }, [props.initial, reset]);

    const onValid: SubmitHandler<FormValues> = (v) => {
        if (props.type === "IF") {
            const r = (v as any)?.config?.rule;
            if (typeof r === "string") {
                try {
                    (v as any).config.rule = JSON.parse(r);
                } catch {
                    alert("Rule must be valid JSON, e.g. { \"in\": [\"CEO\", {\"var\":\"lead.title\"}] }");
                    return; // stop submit
                }
            }
        }
        props.onSubmit({ ...v, type: props.type });
    };

    // props.onSubmit({ ...v, type: props.type });

    return (
        <form onSubmit={handleSubmit(onValid)} className="space-y-3">
            <div>
                <label className="block text-sm font-medium">Name</label>
                <input className="mt-1 w-full rounded border px-3 py-2" {...register("name")} />
                {errors.name && (
                    <p className="text-sm text-red-600">{String(errors.name.message)}</p>
                )}
            </div>

            {/* NOTIFY */}
            {props.type === "NOTIFY" && (
                <>
                    <label className="block text-sm font-medium">Channel</label>
                    <select
                        className="mt-1 w-full rounded border px-3 py-2"
                        {...register("config.channel" as const)}
                    >
                        <option value="console">console</option>
                        <option value="email">email</option>
                        <option value="slack">slack</option>
                    </select>
                    <label className="block text-sm font-medium mt-3">
                        {"Message ({{}} supported)"}
                    </label>
                    <textarea
                        rows={3}
                        className="mt-1 w-full rounded border px-3 py-2"
                        {...register("config.msg" as const)}
                    />
                </>
            )}

            {/* WAIT */}
            {props.type === "WAIT" && (
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-sm font-medium">Seconds</label>
                        <input
                            type="number"
                            className="mt-1 w-full rounded border px-3 py-2"
                            {...register("config.seconds" as const, { valueAsNumber: true })}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium">Minutes</label>
                        <input
                            type="number"
                            className="mt-1 w-full rounded border px-3 py-2"
                            {...register("config.minutes" as const, { valueAsNumber: true })}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium">Hours</label>
                        <input
                            type="number"
                            className="mt-1 w-full rounded border px-3 py-2"
                            {...register("config.hours" as const, { valueAsNumber: true })}
                        />
                    </div>
                </div>
            )}

            {/* EMAIL */}
            {props.type === "EMAIL" && (
                <>
                    <label className="block text-sm font-medium">To</label>
                    <input className="mt-1 w-full rounded border px-3 py-2" {...register("config.to" as const)} />
                    <label className="block text-sm font-medium mt-3">Subject</label>
                    <input className="mt-1 w-full rounded border px-3 py-2" {...register("config.subject" as const)} />
                    <label className="block text-sm font-medium mt-3">Body</label>
                    <textarea rows={4} className="mt-1 w-full rounded border px-3 py-2" {...register("config.body" as const)} />
                </>
            )}

            {/* IF */}
            {props.type === "IF" && (
                <>
                    <label className="block text-sm font-medium">JsonLogic Rule (JSON)</label>
                    <textarea rows={6} className="mt-1 w-full rounded border px-3 py-2" {...register("config.rule" as const)} />
                    <p className="text-xs text-neutral-500 mt-1">
                        Ex: {"{ \"in\": [\"CEO\", {\"var\":\"lead.title\"}] }"}
                    </p>
                </>
            )}

            {/* API_CALL */}
            {props.type === "API_CALL" && (
                <>
                    <label className="block text-sm font-medium">Method</label>
                    <select className="mt-1 w-full rounded border px-3 py-2" {...register("config.method" as const)}>
                        <option>POST</option><option>GET</option><option>PUT</option><option>DELETE</option>
                    </select>

                    <label className="block text-sm font-medium mt-3">URL</label>
                    <input className="mt-1 w-full rounded border px-3 py-2" {...register("config.url" as const)} />

                    <label className="block text-sm font-medium mt-3">Body Template</label>
                    <textarea rows={4} className="mt-1 w-full rounded border px-3 py-2" {...register("config.bodyTemplate" as const)} />
                </>
            )}

            <button type="submit" className="rounded bg-black text-white px-3 py-2">
                Save Node
            </button>
        </form>
    );
}
