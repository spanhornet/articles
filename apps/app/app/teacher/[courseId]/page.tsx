"use client";

import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function Page() {
  // Use useParams to access route parameters
  const params = useParams();
  const courseId = params.courseId;
  const router = useRouter();
  
  return (
    <div>
      <Container>
        <div className="md:flex md:items-center md:justify-between py-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold">Course Editor</h2>
            <p className="text-muted-foreground mt-1">Course ID: {courseId}</p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Button variant="outline">Save</Button>
            <Button variant="default" className="ml-3">Publish</Button>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <p className="text-center text-muted-foreground">
            This page is under construction. You will be able to edit your course content here.
          </p>
        </div>
      </Container>
    </div>
  );
}
