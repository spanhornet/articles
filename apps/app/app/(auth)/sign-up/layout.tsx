// "AuthGuard.tsx"
import { AuthGuard } from '../AuthGuard';

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthGuard guestOnly redirectIfAuthorized="/dashboard">
            <div className="flex items-center justify-center min-h-screen">
                <div className="mx-auto max-w-md w-full px-4 py-12 sm:px-6 lg:px-8">
                    <div className="rounded-lg">
                        {children}
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}