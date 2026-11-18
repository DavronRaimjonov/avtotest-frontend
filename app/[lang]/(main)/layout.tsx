import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

// Header + footer bilan sahifalar. Test sahifasi o'z panelini ishlatadi (bu guruhdan tashqarida).
// Mobilda pastki tab bar — kontent uning ostida qolmasligi uchun pastdan joy qoldiriladi
export default function MainLayout({ children }: LayoutProps<"/[lang]">) {
  return (
    <div className="max-[860px]:pb-[calc(84px+env(safe-area-inset-bottom))]">
      <Header />
      <main className="overflow-x-hidden">{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
