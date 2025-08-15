// app/components/ui/Button.tsx
import type { ElementType, ReactNode, ComponentPropsWithoutRef } from "react";

const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-60";
const variants: Record<"primary" | "secondary" | "outline" | "ghost", string> = {
    primary: "bg-sky-500 text-white hover:bg-sky-400 active:bg-sky-600 ring-offset-1",
    secondary: "bg-indigo-500 text-white hover:bg-indigo-400 active:bg-indigo-600 ring-offset-1",
    outline: "border border-slate-600/60 bg-transparent text-slate-200 hover:bg-slate-800",
    ghost: "text-slate-200 hover:bg-slate-800/60",
};

type ButtonProps<C extends ElementType = "button"> = {
    as?: C;
    variant?: keyof typeof variants;
    children: ReactNode;
    className?: string;
} & Omit<ComponentPropsWithoutRef<C>, "as" | "className">;

export function Button<C extends ElementType = "button">({
    as,
    variant = "primary",
    className,
    children,
    ...rest
}: ButtonProps<C>) {
    const Comp = (as || "button") as ElementType;
    return (
        <Comp
            {...(rest as any)}
            className={`${base} ${variants[variant]} ${className ?? ""}`}
        >
            {children}
        </Comp>
    );
}
