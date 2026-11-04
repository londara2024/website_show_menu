import { AdminPanel } from "./admin-ui";

/** Placeholder while an admin list streams in. */
export function AdminListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      <div className="mb-5 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-[78px] animate-pulse rounded-2xl bg-surface-container" />
        ))}
      </div>
      <AdminPanel className="divide-y divide-border">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="size-12 animate-pulse rounded-lg bg-surface-container" />
            <div className="h-4 flex-1 animate-pulse rounded bg-surface-container" />
            <div className="h-4 w-24 animate-pulse rounded bg-surface-container-low" />
          </div>
        ))}
      </AdminPanel>
    </>
  );
}
