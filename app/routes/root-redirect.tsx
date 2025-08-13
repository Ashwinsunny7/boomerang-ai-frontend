// app/routes/root-redirect.tsx
import { redirect } from "react-router";

// Redirects the index route "/" to "/workflows"
export async function loader() {
    return redirect("/workflows");
}

export default function RootRedirect() {
    return null;
}
