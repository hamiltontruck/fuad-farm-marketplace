import BrokerDashboardPanel from "../../components/operations/BrokerDashboardPanel";
import OperationsShell from "../../components/operations/OperationsShell";

export default function BrokerDashboardPage() {
  return (
    <OperationsShell
      eyebrow="FUAD BROKER"
      title="Broker operations dashboard"
      description="Broker listings, status, portfolio fi customer contact hojii tokko keessatti ilaali."
    >
      <BrokerDashboardPanel />
    </OperationsShell>
  );
}
