import MyListingsPanel from "../../components/operations/MyListingsPanel";
import OperationsShell from "../../components/operations/OperationsShell";

export default function CustomerDashboardPage() {
  return (
    <OperationsShell
      eyebrow="CUSTOMER POST CONTROL"
      title="Customer dashboard"
      description="FUAD account keetiin seeni. Dashboard kun suuraa fi maxxansa mataa keetii qofa agarsiisa; post kee sold, active ykn delete gochuu dandeessa."
    >
      <MyListingsPanel />
    </OperationsShell>
  );
}
