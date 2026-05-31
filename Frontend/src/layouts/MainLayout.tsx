import type {
  ReactNode
} from "react";

import Header from "../components/navigation/Header";

type Props = {
  children: ReactNode;
};

export default function MainLayout({
  children
}: Props) {
  return (
    <>
      <Header />

      <main
        style={{
          minHeight:
            "calc(100vh - 80px)"
        }}
      >
        <div className="page-container">
          {children}
        </div>
      </main>
    </>
  );
}