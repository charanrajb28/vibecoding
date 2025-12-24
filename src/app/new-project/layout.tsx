import AppHeader from '@/components/app-header';

export default function NewProjectLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <AppHeader />
      </div>
      <main>{children}</main>
    </div>
  );
}