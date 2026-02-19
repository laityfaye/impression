// Layout vide pour la page admin — efface le header/footer/StepIndicator du layout global
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
