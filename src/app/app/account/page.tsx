// src/app/app/account/page.tsx
import { Card } from "@/components/ui/card";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your profile and workspace information.
        </p>
      </div>

      {/* PROFILE + BUSINESS */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Profile */}
        <Card className="p-4">
          <p className="text-sm font-semibold">Profile</p>
          <p className="mt-1 text-xs text-slate-500">
            Basic information about your RevenueLens account.
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Full name</span>
              <span className="font-medium text-slate-800">Marc (demo)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-800">
                marc@example.com
              </span>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-slate-500">
            In a future iteration you&apos;ll be able to edit your profile
            details here.
          </p>
        </Card>

        {/* Business */}
        <Card className="p-4">
          <p className="text-sm font-semibold">Business</p>
          <p className="mt-1 text-xs text-slate-500">
            The workspace that owns your datasets and predictions.
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Business name</span>
              <span className="font-medium text-slate-800">Demo business</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Created at</span>
              <span className="font-medium text-slate-800">
                2025-01-01 (demo)
              </span>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-slate-500">
            Later this will be linked to your real business entity and billing
            details.
          </p>
        </Card>
      </div>

      {/* BILLING */}
      <Card className="p-4">
        <p className="text-sm font-semibold">Billing</p>
        <p className="mt-1 text-sm text-slate-500">
          Subscriptions and invoices.
        </p>

        <p className="mt-4 text-xs text-slate-500">
          Subscriptions will be available soon. For now, RevenueLens runs in
          demo mode with no active billing.
        </p>
      </Card>
    </div>
  );
}
