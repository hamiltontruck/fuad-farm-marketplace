import DatabasePostForm from "../../components/operations/DatabasePostForm";
import OperationsShell from "../../components/operations/OperationsShell";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";

export default async function PostPage() {
  const user = await getChatGPTUser();

  return (
    <OperationsShell
      eyebrow="D1 DATABASE + R2 PHOTOS"
      title="Maxxansa browser hundarra hojjetu"
      description="Account identity, listing data fi suuraa cloud storage keessatti kuusi."
    >
      {user ? (
        <DatabasePostForm defaultSeller={user.fullName ?? user.email} />
      ) : (
        <section className="ops-card">
          <h2>Jalqaba Sign in with ChatGPT godhi</h2>
          <p>Ownership sirriitti qabachuuf email account kee server qofa irratti fayyadamna. Password hin arginu.</p>
          <div className="ops-actions"><a className="ops-button" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} href={chatGPTSignInPath("/post")}>Sign in with ChatGPT</a></div>
        </section>
      )}
    </OperationsShell>
  );
}
