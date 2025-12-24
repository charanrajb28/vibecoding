import AppHeader from '@/components/app-header';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}
