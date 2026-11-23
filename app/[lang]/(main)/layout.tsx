import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

// Header + footer bilan sahifalar. Test sahifasi o'z panelini ishlatadi (bu guruhdan tashqarida).
// Mobilda pastki tab bar — kontent uning ostida qolmasligi uchun pastdan joy qoldiriladi.
// Kontent qisqa bo'lsa ham footer ekran pastida turadi: ustun kamida ekran balandligida, main qolgan joyni egallaydi
export default function MainLayout({ children }: LayoutProps<"/[lang]">) {
  return (
    <div className="flex min-h-dvh flex-col max-[860px]:pb-[calc(84px+env(safe-area-inset-bottom))]">
      <Header />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
