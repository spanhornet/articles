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
import { NotebookIcon, NotebookPenIcon, NotebookTextIcon, PlusIcon } from "lucide-react";
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
          <div className="inline-flex items-center gap-1.5">
            <NotebookTextIcon size={16} aria-hidden="true" />
            19 courses
          </div>
        </Container>
      </header>
      
      <main className="py-6">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Your Courses</h1>
            <Button>
              <PlusIcon className="h-4 w-4" /> New course
            </Button>
          </div>
        </Container>
      </main>
    </div>
  );
}