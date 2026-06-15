import { AuthGuard } from '@/components/shared/AuthGuard';
import { Navigation } from '@/components/shared/Navigation';
import Footer from '@/components/shared/Footer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
