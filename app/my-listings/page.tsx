import MyListingsPanel from "../../components/operations/MyListingsPanel";
import OperationsShell from "../../components/operations/OperationsShell";

export default function MyListingsPage() {
  return (
    <OperationsShell
      eyebrow="SUPABASE OWNER CONTROL"
      title="Maxxansa koo"
      description="Browser kam irraa iyyuu FUAD account keetiin seeni; maxxansa kee ilaali, sold godhi ykn delete godhi."
    >
      <MyListingsPanel />
    </OperationsShell>
  );
}
