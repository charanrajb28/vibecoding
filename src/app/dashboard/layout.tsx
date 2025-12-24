import AppHeader from '@/components/app-header';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <AppHeader />
      </div>
      <main className="container w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}