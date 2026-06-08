// layouts/MainLayout.tsx
import type { ReactNode } from "react";
import Header from "../components/navigation/Header";
import Sidebar from "../components/navigation/Sidebar";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="main-layout">
      <Header />
      <div className="layout-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-container">
            {children}
          </div>
        </main>
      </div>
      <footer className="main-footer">
        <div className="page-container">
          <p>© 2024 Mafia Online. Усі права захищені.</p>
        </div>
      </footer>
    </div>
  );
}