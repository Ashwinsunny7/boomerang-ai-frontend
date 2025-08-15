import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/root-redirect.tsx"),

    // workflows
    route("workflows", "routes/workflows.tsx"),
    route("workflows/new", "routes/workflows-new.tsx"),   // wrapper file we added
    route("workflows/:id/edit", "routes/workflows-edit.tsx"),
    route("actions/new", "routes/actions-new.tsx"),


    // runs
    route("runs", "routes/runs.tsx"),
    route("runs/:runId", "routes/run-detail.tsx"),

    // playground
    route("playground/trigger-leads", "routes/trigger-leads.tsx"),

] satisfies RouteConfig;
