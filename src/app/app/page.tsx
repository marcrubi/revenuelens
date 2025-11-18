// src/app/app/page.tsx
import { redirect } from "next/navigation";

export default function AppIndexPage() {
  redirect("/app/dashboard");
}
