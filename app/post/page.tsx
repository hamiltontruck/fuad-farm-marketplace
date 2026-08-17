import DatabasePostForm from "../../components/operations/DatabasePostForm";
import OperationsShell from "../../components/operations/OperationsShell";

export default function PostPage() {
  return (
    <OperationsShell
      eyebrow="SUPABASE DATABASE + STORAGE"
      title="Maxxansa browser hundarra hojjetu"
      description="FUAD account, listing data fi suuraa Supabase cloud keessatti kuusi."
    >
      <DatabasePostForm />
    </OperationsShell>
  );
}
