// app/routes/index.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Workflows, Runs, Actions } from "../lib/api";
import type { Workflow, Run, ActionKind } from "../lib/types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Stat } from "../components/ui/Stat";

export default function Dashboard() {
    // Important: wrap queryFn in an arrow; don’t pass the function reference
    const workflowsQ = useQuery<Workflow[]>({
        queryKey: ["workflows"],
        queryFn: () => Workflows.list(),
    });
    const runsQ = useQuery<Run[]>({
        queryKey: ["runs"],
        queryFn: () => Runs.list(),
    });
    const actionsQ = useQuery<ActionKind[]>({
        queryKey: ["actions"],
        queryFn: () => Actions.list(),
    });

    const wfCount = workflowsQ.data?.length ?? 0;
    const runCount = runsQ.data?.length ?? 0;
    const nodeKinds = actionsQ.data?.length ?? 0;

    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-lg">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-white">
                            Workflows – Studio
                        </h1>
                        <p className="mt-1 text-sm text-slate-300">
                            Design workflows, manage nodes, monitor runs, and trigger tests — all in one place.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button as={Link} to="/workflows/new" variant="primary">
                            + Create New Workflow
                        </Button>
                        <Button as={Link} to="/actions/new" variant="secondary">
                            + Create New Node
                        </Button>
                        <Button as={Link} to="/playground/trigger-leads" variant="outline">
                            Trigger Test
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Workflows" value={workflowsQ.isLoading ? "…" : wfCount} hint="View all" href="/workflows" />
                <Stat label="Dynamic Nodes" value={actionsQ.isLoading ? "…" : nodeKinds} hint="Add nodes" href="/actions/new" />
                <Stat label="Total Runs" value={runsQ.isLoading ? "…" : runCount} hint="See runs" href="/runs" />
                <Stat label="Trigger Tester" value={<span className="text-xs">Quick Start</span>} hint="Open tester" href="/playground/trigger-leads" />
            </div>

            {/* Shortcuts */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card title="Workflows" description="Create, edit and manage workflow graphs.">
                    <div className="flex flex-wrap gap-2">
                        <Button as={Link} to="/workflows/new" variant="primary">
                            New Workflow
                        </Button>
                        <Button as={Link} to="/workflows" variant="outline">
                            View Workflows
                        </Button>
                    </div>
                </Card>

                <Card title="Runs" description="Inspect recent executions and live logs.">
                    <div className="flex flex-wrap gap-2">
                        <Button as={Link} to="/runs" variant="outline">
                            Open Runs
                        </Button>
                        <Button as={Link} to="/playground/trigger-leads" variant="outline">
                            Trigger Test
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
