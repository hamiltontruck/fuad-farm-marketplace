import OperationsShell from "../../components/operations/OperationsShell";
import SystemCheckPanel from "../../components/operations/SystemCheckPanel";

export default function SystemCheckPage() {
  return (
    <OperationsShell
      eyebrow="SUPABASE + BROWSER TEST"
      title="System check"
      description="Supabase database, listing-images Storage, account, admin fi browser access mirkaneessi."
    >
      <SystemCheckPanel />
    </OperationsShell>
  );
}
