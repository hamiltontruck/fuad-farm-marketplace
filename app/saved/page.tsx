import OperationsShell from "../../components/operations/OperationsShell";
import SavedListingsPanel from "../../components/operations/SavedListingsPanel";

export default function SavedListingsPage() {
  return (
    <OperationsShell
      eyebrow="FUAD SAVED"
      title="Saved marketplace posts"
      description="Post barbaachisaa account kee keessatti dhuunfaatti kuusi fi yeroo barbaadde deebi'i."
    >
      <SavedListingsPanel />
    </OperationsShell>
  );
}
