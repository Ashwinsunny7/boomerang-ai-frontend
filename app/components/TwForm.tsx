// app/components/TwForm.tsx
import React from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import type { RJSFSchema, WidgetProps, FieldTemplateProps, ObjectFieldTemplateProps, GenericObjectType, ValidatorType } from "@rjsf/utils";

function BaseInputTemplate<T, S extends RJSFSchema, F extends GenericObjectType>({ value, onChange, type }: WidgetProps<T, S, F>) {
    return (
        <input type={(type as string) ?? "text"} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 text-slate-100 px-3 py-2 text-sm" value={(value as any) ?? ""} onChange={(e) => onChange(e.target.value as any)} />
    );
}

function TextareaTemplate<T, S extends RJSFSchema, F extends GenericObjectType>({ value, onChange }: WidgetProps<T, S, F>) {
    return (
        <textarea rows={6} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 text-slate-100 px-3 py-2 text-sm" value={(value as any) ?? ""} onChange={(e) => onChange(e.target.value as any)} />
    );
}

function SelectWidget<T, S extends RJSFSchema, F extends GenericObjectType>({ value, onChange, options }: WidgetProps<T, S, F>) {
    return (
        <select className="mt-1 w-full rounded border border-slate-700 bg-slate-900 text-slate-100 px-3 py-2 text-sm" value={(value as any) ?? ""} onChange={(e) => onChange(e.target.value as any)}>
            {options.enumOptions?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

function FieldTemplate<T, S extends RJSFSchema, F extends GenericObjectType>({ id, classNames, label, help, errors, description, children, required }: FieldTemplateProps<T, S, F>) {
    if (classNames?.includes("field-hidden")) return <>{children}</>;
    return (
        <div className="mb-3 text-slate-100">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-white">
                    {label}
                    {required ? <span className="text-rose-400"> *</span> : null}
                </label>
            )}
            {description}
            {children}
            {errors}
            {help}
        </div>
    );
}

function ObjectFieldTemplate<T, S extends RJSFSchema, F extends GenericObjectType>({ title, description, properties }: ObjectFieldTemplateProps<T, S, F>) {
    return (
        <div className="mb-2 text-slate-100">
            {title ? <div className="text-sm font-semibold text-white mb-1">{title}</div> : null}
            {description}
            <div>{properties.map((p) => p.content)}</div>
        </div>
    );
}

type TwFormProps = { schema: RJSFSchema; uiSchema?: any; formData?: any; onSubmit?: (e: { formData: any }) => void; children?: React.ReactNode; className?: string };

export function TwForm({ className, schema, uiSchema, formData, onSubmit, children }: TwFormProps) {
    return (
        <Form
            validator={validator as unknown as ValidatorType<any, any, any>}
            schema={schema}
            uiSchema={uiSchema}
            formData={formData}
            onSubmit={(evt) => onSubmit?.({ formData: evt.formData })}
            widgets={{ BaseInput: BaseInputTemplate, TextWidget: BaseInputTemplate, TextareaWidget: TextareaTemplate, SelectWidget }}
            templates={{ FieldTemplate, ObjectFieldTemplate }}
            className={`rjsf-tailwind ${className ?? ""}`}
        >
            {children}
        </Form>
    );
}