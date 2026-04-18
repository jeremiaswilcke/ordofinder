import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <TopAppBar locale={locale} />
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">{children}</main>
        <BottomNavBar locale={locale} />
      </div>
    </NextIntlClientProvider>
  );
}
