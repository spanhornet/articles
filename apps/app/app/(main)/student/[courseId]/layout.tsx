import { AuthGuard } from "@/app/(auth)/AuthGuard"

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AuthGuard authRequired allowedRoles={["STUDENT", "TEACHER"]} redirectTo="/sign-in">
        <div className="flex flex-col h-screen">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </AuthGuard>
    </>
  )
}