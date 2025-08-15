// app/root.tsx
import "./app.css";
import { Outlet, Scripts, ScrollRestoration, Link } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Boomerang – Workflow Studio</title>
      </head>
      <body className="bg-neutral-50 text-neutral-900">
        <QueryClientProvider client={queryClient}>
          <div className="min-h-dvh grid grid-rows-[auto,1fr]">
            <header className="border-b bg-white">
              <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
                <div className="font-semibold text-rose-500">Boomerang – Workflow Studio</div>
                <nav className="text-sm flex gap-4">
                  <Link to="/actions/new">Add Nodes</Link>
                  <Link to="/workflows">Workflows</Link>
                  <Link to="/runs">Runs</Link>
                  <Link to="/playground/trigger-leads">Trigger Tester</Link>

                </nav>
              </div>
            </header>

            <main className="mx-auto max-w-5xl w-full p-4">
              <Outlet />
            </main>
          </div>
          <ScrollRestoration />
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  );
}
