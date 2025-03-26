// `SignUpForm.tsx`
import { SignUpForm } from "./SignUpForm"

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="mx-auto max-w-md w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-2">Sign Up</h1>
          <p>
            Enroll in courses taught by qualified instructors and explore artworks from around the world.
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}