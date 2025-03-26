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
    LogOutIcon, 
    UserIcon,
    LoaderCircle,
    NotebookPen,
    Notebook
} from "lucide-react";

export function UserDropdown() {
    const router = useRouter();

    const { 
      signOut,
      user,
      loading
    } = useAuth();

    const path = usePathname();

    const handleSignOut = async () => {
      await signOut();
      router.push("/sign-in");
    };

    return (
      <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="icon" 
            variant="outline" 
            aria-label="Open account menu"
            className="hover:cursor-pointer"
          >
            <UserIcon size={16} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-64">
          <DropdownMenuLabel className="flex items-start gap-3">
            <div className="flex min-w-0 flex-col">
              {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                  <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
                </div>
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
          {
            user?.role === "TEACHER" && path === "/student" && (
              <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/teacher")} className="cursor-pointer">
                <NotebookPen size={16} className="text-muted-foreground" aria-hidden="true" />
                <span>Teacher view</span>
              </DropdownMenuItem>
            </>
            ) 
          }
          {
            user?.role === "TEACHER" && path === "/teacher" && (
              <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/student")} className="cursor-pointer">
                <Notebook size={16} className="text-muted-foreground" aria-hidden="true" />
                <span>Student view</span>
              </DropdownMenuItem>
            </>
            ) 
          }
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
              <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </>
    );

}
