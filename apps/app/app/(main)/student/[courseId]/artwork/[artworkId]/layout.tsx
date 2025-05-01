import { AuthGuard } from "@/app/(auth)/AuthGuard";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    courseId: string;
    artworkId: string;
  };
}

export default async function ArtworkLayout({ children }: LayoutProps) {
  return (
    <AuthGuard authRequired allowedRoles={["STUDENT", "TEACHER"]} redirectTo="/sign-in">
      <div className="flex flex-col">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
