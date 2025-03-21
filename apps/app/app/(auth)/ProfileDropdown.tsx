// Authorization
import { useAuth } from "@/hooks/useAuth";

// Next.js Components
import Link from "next/link";

// Next.js Hooks
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

// Shadcn/ui Components
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Lucide Icons
import { 
    NotebookIcon, 
    NotebookPenIcon, 
    LogOutIcon, 
    UserIcon 
} from "lucide-react";

export function ProfileDropdown() {
    const router = useRouter();

    const { 
        signOut,
        user,
        loading
    } = useAuth();

    const path = usePathname();
    console.log(path);

    const handleSignOut = async () => {
        await signOut();
        router.push("/sign-in");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" aria-label="Open account menu">
                <UserIcon size={16} aria-hidden="true" />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-w-64">
                <DropdownMenuLabel className="flex items-start gap-3">
                    <div className="flex min-w-0 flex-col">
                    {loading ? (
                        <span className="text-muted-foreground text-sm">Loading...</span>
                    ) : (
                        <>
                        <span className="text-foreground truncate text-sm font-medium">
                            {user?.name || ""}
                        </span>
                        <span className="text-muted-foreground truncate text-xs font-normal">
                            {user?.email || ""}
                        </span>
                        </>
                    )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {path !== "/student" && (
                    <>
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href="/student">
                                    <NotebookIcon size={16} className="mr-2 opacity-60" aria-hidden="true" />
                                    <span>Student view</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </>
                )}
                {(user?.role === "TEACHER" && path !== "/teacher") && (
                    <>
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href="/teacher">
                                    <NotebookPenIcon size={16} className="mr-2 opacity-60" aria-hidden="true" />
                                    <span>Teacher view</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </>
                )}
                <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOutIcon size={16} className="mr-2 opacity-60" aria-hidden="true" />
                <span>Sign Out</span>
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

}