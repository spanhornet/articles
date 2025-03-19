"use client";

// Authorization
import { useAuthContext } from "@/app/(auth)/AuthProvider";

// Shadcn/ui Components
import { Button } from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Lucide Icons
import { NotebookIcon, NotebookPenIcon, PlusIcon } from "lucide-react";
import { Container } from "@/components/container";

export default function Page() {
    return (
        <div>
            <header className="border-b py-4">
                <Container className="flex items-center justify-between">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/student" className="inline-flex items-center gap-1.5">
                                    <NotebookIcon size={16} aria-hidden="true" />
                                    Student view
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="inline-flex items-center gap-1.5">
                                    <NotebookPenIcon size={16} aria-hidden="true" />
                                    Teacher view
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <Button size="sm">
                        <PlusIcon /> New course
                    </Button>
                </Container>
            </header>
        </div>
    );
}