import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function OperationsShell({ eyebrow, title, description, children }: Props) {
  return (
    <main className="ops-page">
      <div className="ops-shell">
        <header className="ops-topbar">
          <div>
            <span className="ops-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <a className="ops-back" href="/">← Marketplace</a>
        </header>
        {children}
      </div>
    </main>
  );
}
