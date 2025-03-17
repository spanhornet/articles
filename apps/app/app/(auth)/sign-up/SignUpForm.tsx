"use client"

import React from "react";

import { cn } from "@/lib/utils";

// Zod
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// React Hooks
import { useState } from "react";
import { useForm } from "react-hook-form";

// Shadcn/ui Components
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"

// Phone Number Input
import { PhoneNumberInput } from "@/components/ui/phone-number-input";

const formSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is invalid"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
        .regex(/[0-9]/, "Password must contain at least 1 number")
        .regex(/\W/, "Password must contain at least 1 special character"),
});

// Lucide Icons
import { LoaderCircle, Phone } from 'lucide-react';

// Radix UI Icons
import { EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";

// Font Awesome Icons
import { 
    FaGoogle,
    FaGithub,
    FaFacebook
} from "react-icons/fa";

// Next.js Components
import Link from "next/link";

export function SignUpForm({
    className,
    ...props
} : React.ComponentPropsWithoutRef<"div">) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            password: "",
        },
    });

    const [isLoading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const toggleIsPasswordVisibility = () => {
        setIsPasswordVisible((state) => !state);
    };

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        console.log(values);
    } 

    return (
        <div className={cn("flex flex-col gap-4", className)} {...props}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* `firstName` field */}
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        First name
                                        <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="John" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* `lastName` field */}
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Last name
                                        <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* `email` field */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>
                                Email address
                                <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="johndoe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* `phone` field */}
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>
                                Phone number 
                                <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <PhoneNumberInput {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    {/* `password` field */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>
                                Password <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        {...field}
                                        type={isPasswordVisible ? "text" : "password"}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="px-4"
                                        onClick={toggleIsPasswordVisibility}
                                    >
                                        {isPasswordVisible ? (
                                            <EyeNoneIcon className="h-4 w-4" />
                                        ) : (
                                            <EyeOpenIcon className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <LoaderCircle className="animate-spin" />
                                Signing up
                            </>
                        ) : (
                                "Sign up"
                        )}
                    </Button>
                </form>
                <div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1">
                    <span className="text-muted-foreground text-xs">OR CONTINUE WITH</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button 
                        className="flex-1" 
                        variant="outline" 
                        aria-label="Login with Google" 
                        size="icon"
                    >
                        <FaGoogle />
                    </Button>
                    <Button 
                        className="flex-1" 
                        variant="outline" 
                        aria-label="Login with Facebook" 
                        size="icon"
                    >
                        <FaFacebook />
                    </Button>
                    <Button 
                        className="flex-1" 
                        variant="outline" 
                        aria-label="Login with GitHub" 
                        size="icon"
                    >
                        <FaGithub />
                    </Button>
                </div>
                <div className="text-center text-sm">
                    Already have an account?
                    {" "}
                    <Link href="/sign-in" className="underline">Sign in</Link>
                </div>
            </Form>
        </div>
    );
}