import type { Language } from "../../lib/i18n";

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
  amharic: string;
  description: string;
  descriptionEnglish: string;
  descriptionAmharic: string;
}> = [
  { id: "farmer", icon: "👨‍🌾", label: "Qonnaan bulaa", english: "Farmer", amharic: "ገበሬ", description: "Oomisha qonnaa gurguri", descriptionEnglish: "Sell farm products", descriptionAmharic: "የእርሻ ምርት ይሽጡ" },
  { id: "manufacturer", icon: "🏭", label: "Oomishtaa", english: "Manufacturer", amharic: "አምራች", description: "Oomisha warshaa maxxansi", descriptionEnglish: "List manufactured goods", descriptionAmharic: "የፋብሪካ ምርት ያስተዋውቁ" },
  { id: "seller", icon: "🏪", label: "Gurguraa", english: "Seller", amharic: "ሻጭ", description: "Daldala kee guddisi", descriptionEnglish: "Grow your business", descriptionAmharic: "ንግድዎን ያሳድጉ" },
  { id: "broker", icon: "🤝", label: "Broker", english: "Broker", amharic: "ደላላ", description: "Bitataa fi gurguraa wal qunnamsiisi", descriptionEnglish: "Connect buyers and sellers", descriptionAmharic: "ገዢና ሻጭን ያገናኙ" },
  { id: "electronics", icon: "💻", label: "Elektirooniksii", english: "Electronics", amharic: "ኤሌክትሮኒክስ", description: "Meeshaa technology gurguri", descriptionEnglish: "Sell technology products", descriptionAmharic: "የቴክኖሎጂ ዕቃዎችን ይሽጡ" },
  { id: "mineral", icon: "🪨", label: "Albuuda", english: "Mineral", amharic: "ማዕድን", description: "Albuuda biti, gurguri ykn broker ta'i", descriptionEnglish: "Buy, sell or broker minerals", descriptionAmharic: "ማዕድን ይግዙ፣ ይሽጡ ወይም ያደላልሉ" },
  { id: "buyer", icon: "🛒", label: "Bitataa", english: "Buyer", amharic: "ገዢ", description: "Wanta barbaaddu maxxansi", descriptionEnglish: "Post what you want to buy", descriptionAmharic: "መግዛት የሚፈልጉትን ይለጥፉ" },
];

export function getRoleName(role: (typeof roleOptions)[number], language: Language) {
  if (language === "om") return role.label;
  if (language === "am") return role.amharic;
  return role.english;
}

export function getRoleDescription(role: (typeof roleOptions)[number], language: Language) {
  if (language === "om") return role.description;
  if (language === "am") return role.descriptionAmharic;
  return role.descriptionEnglish;
}

type RoleSelectorProps = {
  value: RoleId | null;
  onChange: (role: RoleId) => void;
  language: Language;
};

export default function RoleSelector({ value, onChange, language }: RoleSelectorProps) {
  return (
    <div className="role-selector" role="radiogroup" aria-label={language === "om" ? "Gahee marketplace kee fili" : language === "am" ? "የገበያ ሚናዎን ይምረጡ" : "Select your marketplace role"}>
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
            <strong>{getRoleName(role, language)}</strong>
            <small>{language === "en" ? role.label : role.english}</small>
            <em>{getRoleDescription(role, language)}</em>
          </span>
          <span className="role-check" aria-hidden="true">✓</span>
        </button>
      ))}
    </div>
  );
}
