// Shacn/ui Components
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis
} from "@/components/ui/breadcrumb";
import { Container } from "@/components/container";

// Lucide Icons
import { CalendarClockIcon, NotebookIcon, NotebookPenIcon, NotebookTextIcon, PencilRulerIcon } from "lucide-react";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
      <>
        <header className="border-b py-4">
            <Container className="flex items-center justify-between">
            <Breadcrumb>
                <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbEllipsis className="inline-flex sm:hidden" />
                    <BreadcrumbLink 
                        href="/student" 
                        className="hidden sm:inline-flex items-center gap-1.5"
                    >
                        <NotebookIcon size={16} aria-hidden="true" />
                        Student view
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/teacher" className="inline-flex items-center gap-1.5">
                        <NotebookPenIcon size={16} aria-hidden="true" />
                        Teacher view
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage className="inline-flex items-center gap-1.5">
                        <PencilRulerIcon size={16} aria-hidden="true" />
                        Course editor
                    </BreadcrumbPage>
                </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            </Container>
        </header>
        <main>{children}</main>
      </>
    )
  }