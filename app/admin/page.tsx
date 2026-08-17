import AdminPanel from "../../components/operations/AdminPanel";
import OperationsShell from "../../components/operations/OperationsShell";

export default function AdminPage() {
  return (
    <OperationsShell
      eyebrow="SUPABASE ADMIN CONTROL"
      title="Marketplace moderation"
      description="Maxxansa gurgurame, broker post fi content hin barbaachifne RLS security waliin to'adhu."
    >
      <AdminPanel />
    </OperationsShell>
  );
}
