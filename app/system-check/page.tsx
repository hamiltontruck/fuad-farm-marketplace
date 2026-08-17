import OperationsShell from "../../components/operations/OperationsShell";
import SystemCheckPanel from "../../components/operations/SystemCheckPanel";

export default function SystemCheckPage() {
  return (
    <OperationsShell
      eyebrow="DEPLOY + BROWSER TEST"
      title="System check"
      description="API, D1 database, R2 photo storage, admin secret fi browser access mirkaneessi."
    >
      <SystemCheckPanel />
    </OperationsShell>
  );
}
