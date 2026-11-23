import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import type { TestLang } from "@/@types";
import { BRAND_NAME } from "@/components/layout/logo";
import { createServerI18n, LANGUAGES, LOCALE_CODES } from "@/i18n";
import { localePath } from "@/lib/routes";
import ProviderApi from "@/provider";
import "../globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

// viewportFit: cover — iPhone'da pastki tab bar safe area (env(safe-area-inset-bottom)) bilan ishlashi uchun
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0E1A3A",
};

// Til URL'dan: / (uzb), /uzc, /ru. Prefikssiz yo'llarni proxy.ts ichkarida /uzb ga rewrite qiladi
export const generateStaticParams = () => LANGUAGES.map((lang) => ({ lang }));

const isLang = (value: string): value is TestLang => LANGUAGES.includes(value as TestLang);

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const { t } = createServerI18n(lang);
  return {
    title: { default: t("meta.title"), template: `%s · ${BRAND_NAME}` },
    applicationName: BRAND_NAME,
    description: t("meta.description"),
    // Qidiruv tizimlari uchun boshqa tildagi nusxalar
    alternates: {
      languages: Object.fromEntries(LANGUAGES.map((l) => [LOCALE_CODES[l], localePath(l, "/")])),
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html lang={LOCALE_CODES[lang]} className={manrope.variable}>
      {/* Brauzer kengaytmalari (ColorZilla, Grammarly va h.k.) <body>ga atribut qo'shadi — shu sabab hydration ogohlantirishi
          chiqmasin. Faqat body'ning o'z atributlariga ta'sir qiladi, ichidagi komponentlar odatdagidek tekshiriladi */}
      <body className="min-h-dvh" suppressHydrationWarning>
        {/* key — til almashganda i18n instance yangi tilda qayta yaratiladi */}
        <ProviderApi key={lang} lang={lang}>
          {children}
        </ProviderApi>
      </body>
    </html>
  );
}
