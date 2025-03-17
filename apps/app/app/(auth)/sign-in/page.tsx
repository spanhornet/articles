// `SignInForm.tsx`
import { SignInForm } from "./SignInForm"

export default function Page() {
    return (
        <>
            <div className="mb-6">
                <h1 className="text-xl font-bold mb-2">Sign In</h1>
                <p>
                    Continue your enrolled courses or discover new ones taught by qualified instructors.
                </p>
            </div>
            <SignInForm />
        </>
    )
}