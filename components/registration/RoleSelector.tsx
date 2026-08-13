export type RoleId =
  | "farmer"
  | "manufacturer"
  | "seller"
  | "broker"
  | "electronics"
  | "mineral"
  | "buyer";

export const roleOptions: Array<{
  id: RoleId;
  icon: string;
  label: string;
  english: string;
  description: string;
}> = [
  { id: "farmer", icon: "👨‍🌾", label: "Qonnaan bulaa", english: "Farmer", description: "Oomisha qonnaa gurguri" },
  { id: "manufacturer", icon: "🏭", label: "Oomishtaa", english: "Manufacturer", description: "Oomisha warshaa maxxansi" },
  { id: "seller", icon: "🏪", label: "Gurguraa", english: "Seller", description: "Daldala kee guddisi" },
  { id: "broker", icon: "🤝", label: "Broker", english: "Broker", description: "Bitataa fi gurguraa wal qunnamsiisi" },
  { id: "electronics", icon: "💻", label: "Elektirooniksii", english: "Electronics", description: "Meeshaa technology gurguri" },
  { id: "mineral", icon: "🪨", label: "Albuuda", english: "Mineral", description: "Albuuda biti, gurguri ykn broker ta'i" },
  { id: "buyer", icon: "🛒", label: "Bitataa", english: "Buyer", description: "Wanta barbaaddu maxxansi" },
];

type RoleSelectorProps = {
  value: RoleId | null;
  onChange: (role: RoleId) => void;
};

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="role-selector" role="radiogroup" aria-label="Select your marketplace role">
      {roleOptions.map((role) => (
        <button
          className={value === role.id ? "role-card selected" : "role-card"}
          key={role.id}
          type="button"
          role="radio"
          aria-checked={value === role.id}
          onClick={() => onChange(role.id)}
        >
          <span className="role-icon" aria-hidden="true">{role.icon}</span>
          <span className="role-copy">
            <strong>{role.label}</strong>
            <small>{role.english}</small>
            <em>{role.description}</em>
          </span>
          <span className="role-check" aria-hidden="true">✓</span>
        </button>
      ))}
    </div>
  );
}
