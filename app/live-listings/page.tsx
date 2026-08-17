import OperationsShell from "../../components/operations/OperationsShell";
import PublicListingsPanel from "../../components/operations/PublicListingsPanel";

export default function LiveListingsPage() {
  return (
    <OperationsShell
      eyebrow="LIVE D1 MARKETPLACE"
      title="Cloud listings"
      description="Maxxansa fi suuraa database keessaa browser hundarra yeroo tokko keessatti ilaali."
    >
      <PublicListingsPanel />
    </OperationsShell>
  );
}
