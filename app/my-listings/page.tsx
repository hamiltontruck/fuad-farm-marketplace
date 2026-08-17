import MyListingsPanel from "../../components/operations/MyListingsPanel";
import OperationsShell from "../../components/operations/OperationsShell";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";

export default async function MyListingsPage() {
  const user = await getChatGPTUser();

  return (
    <OperationsShell
      eyebrow="OWNER CONTROL"
      title="Maxxansa koo"
      description="Browser kam irraa iyyuu maxxansa kee ilaali, sold godhi ykn delete godhi."
    >
      {user ? (
        <MyListingsPanel />
      ) : (
        <section className="ops-card">
          <h2>Account kee seeni</h2>
          <p>Maxxansa eenyu akka ta'e database keessatti mirkaneessuuf Sign in with ChatGPT barbaachisa.</p>
          <div className="ops-actions"><a className="ops-button" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} href={chatGPTSignInPath("/my-listings")}>Sign in with ChatGPT</a></div>
        </section>
      )}
    </OperationsShell>
  );
}
