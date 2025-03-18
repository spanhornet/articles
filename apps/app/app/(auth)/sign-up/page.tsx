// `SignUpForm.tsx`
import { SignUpForm } from "./SignUpForm"

export default async function Page() {
    return (
        <>
            <div className="mb-8 text-center">
                <h1 className="text-xl font-bold mb-2">Sign Up — Articles</h1>
                <p>
                    Enroll in courses taught by qualified instructors and explore artworks from around the world.
                </p>
            </div>
            <SignUpForm />
        </>
    )
}