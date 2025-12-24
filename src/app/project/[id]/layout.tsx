export const metadata = {
  title: 'Editor | CodeSail',
};

export default function IDELayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen w-screen overflow-hidden">{children}</div>;
}
