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
      <body className="bg-slate-950 text-slate-100">
        <QueryClientProvider client={queryClient}>
          <div className="min-h-dvh grid grid-rows-[auto,1fr]">

            {/* Fixed Header */}
            <header className="fixed top-0 left-0 w-full h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 z-50">
              <Link to="/" className="text-lg font-semibold text-white">Boomerang Studio</Link>
              <nav className="flex gap-6 text-slate-300">
                <Link to="/actions/new" className="hover:text-white">Add Nodes</Link>
                <Link to="/workflows" className="hover:text-white">Workflows</Link>
                <Link to="/runs" className="hover:text-white">Runs</Link>
                <Link to="/playground/trigger-leads" className="hover:text-white">Trigger Tester</Link>
              </nav>
            </header>

            {/* Content with top padding so it clears the fixed header */}
            <main className="mx-auto max-w-7xl w-full p-4 pt-20">
              {/* Welcome Banner */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Welcome to <span className="text-sky-400">BoomerangAI Studio</span>
                </h1>
                <p className="text-slate-400 text-sm">
                  Your hub for designing workflows, managing nodes, and monitoring runs.
                </p>
              </div>

              <Outlet />
            </main>

            {/* Fixed Footer */}
            <footer className="fixed bottom-0 left-0 w-full h-12 bg-slate-950 border-t border-slate-800 flex items-center justify-center text-slate-400 text-sm z-50">
              © {new Date().getFullYear()} BoomerangAI Studio — All rights reserved.
            </footer>
          </div>
          <ScrollRestoration />
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  );

}