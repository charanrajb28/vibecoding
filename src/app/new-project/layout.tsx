import AppHeader from '@/components/app-header';

export default function NewProjectLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
       <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-7xl items-center">
            <AppHeader />
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
