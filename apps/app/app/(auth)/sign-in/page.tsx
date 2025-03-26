// `SignInForm.tsx`
import { SignInForm } from "./SignInForm"

// `AuthGuard.tsx`
import { AuthGuard } from "@/app/(auth)/AuthGuard"

export default function Page() {
  return (
    <AuthGuard guestOnly redirectTo="/student">
      <div className="flex items-center justify-center min-h-screen">
        <div className="mx-auto max-w-md w-full px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold mb-2">Sign In</h1>
            <p>
              Continue your enrolled courses or discover new ones taught by qualified instructors.
            </p>
          </div>
          <SignInForm />
        </div>
      </div>
    </AuthGuard>
  )
}