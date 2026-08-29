import NotificationsPanel from "../../components/operations/NotificationsPanel";
import OperationsShell from "../../components/operations/OperationsShell";

export default function NotificationsPage() {
  return (
    <OperationsShell
      eyebrow="FUAD ALERTS"
      title="Account notifications"
      description="Post moderation fi admin action account kee irratti yeroo tokko keessatti ilaali."
    >
      <NotificationsPanel />
    </OperationsShell>
  );
}
