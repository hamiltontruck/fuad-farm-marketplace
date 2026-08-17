import AdminPanel from "../../components/operations/AdminPanel";
import OperationsShell from "../../components/operations/OperationsShell";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
import { hasAdminConfiguration, isConfiguredAdmin } from "../runtime-storage";

export default async function AdminPage() {
  const user = await getChatGPTUser();
  const configured = await hasAdminConfiguration();
  const admin = user ? await isConfiguredAdmin(user.email) : false;

  return (
    <OperationsShell
      eyebrow="ADMIN CONTROL CENTER"
      title="Marketplace moderation"
      description="Maxxansa gurgurame, broker post fi content hin barbaachifne to'adhu."
    >
      {!user ? (
        <section className="ops-card">
          <h2>Admin account seeni</h2>
          <p>Admin authorization server irratti mirkanaa'a.</p>
          <div className="ops-actions"><a className="ops-button" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} href={chatGPTSignInPath("/admin")}>Sign in with ChatGPT</a></div>
        </section>
      ) : !configured ? (
        <section className="ops-card">
          <h2>ADMIN_EMAILS secret hin qophoofne</h2>
          <p className="ops-note">Sites → More actions → Settings → Environment variables/secrets keessatti <strong>ADMIN_EMAILS</strong> jedhu dabali. Value isaa email ChatGPT account admin godhi; admin hedduu yoo ta'e comma fayyadami.</p>
          <p>Account amma seene: <strong>{user.email}</strong></p>
        </section>
      ) : !admin ? (
        <section className="ops-card">
          <h2>Account kun admin miti</h2>
          <p><strong>{user.email}</strong> ADMIN_EMAILS keessatti hin jiru.</p>
        </section>
      ) : (
        <AdminPanel />
      )}
    </OperationsShell>
  );
}
