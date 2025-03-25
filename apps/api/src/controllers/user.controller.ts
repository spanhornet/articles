import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth";

export const getUser = async (req: Request, res: Response) => {
  try {
    // Use Better-Auth to get the session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // If no session, return unauthorized
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Return the user from the session
    return res.status(200).json({
      user: session.user
    });
  } catch (error: any) {
    return res.status(500).json({ message: "An error occurred while retrieving the user" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe = true } = req.body;

    // Use Better-Auth to sign in
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe
      },
      headers: fromNodeHeaders(req.headers),
      asResponse: true // Return a response object instead of data
    });

    // Extract headers, status, and body from the response
    const headers = Object.fromEntries(response.headers.entries());
    const status = response.status;
    const body = await response.json().catch(() => ({}));

    // Set any cookies or headers from the response
    Object.entries(headers).forEach(([key, value]) => {
      if (key.toLowerCase() === "set-cookie" && value) {
        res.setHeader("Set-Cookie", value);
      }
    });

    return res.status(status).json(body);
  } catch (error: any) {
    console.error("Sign in error:", error);
    return res.status(500).json({ message: error.message || "An error occurred during sign in" });
  }
};

export const signUp = async (req: Request, res: Response) => {
  try {
    const { 
      firstName,
      lastName,
      email,
      phone,
      password
     } = req.body;

    // Use Better-Auth to sign up
    const response = await auth.api.signUpEmail({
      body: {
        name: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        password: password,
      },
      headers: fromNodeHeaders(req.headers),
      asResponse: true // Return a response object instead of data
    });

    // Extract headers, status, and body from the response
    const headers = Object.fromEntries(response.headers.entries());
    const status = response.status;
    const body = await response.json().catch(() => ({}));

    // Set any cookies or headers from the response
    Object.entries(headers).forEach(([key, value]) => {
      if (key.toLowerCase() === "set-cookie" && value) {
        res.setHeader("Set-Cookie", value);
      }
    });

    return res.status(status).json(body);
  } catch (error: any) {
    console.error("Sign up error:", error);
    return res.status(500).json({ message: error.message || "An error occurred during sign up" });
  }
};

export const signOut = async (req: Request, res: Response) => {
  try {
    // Use Better-Auth to sign out
    const response = await auth.api.signOut({
      headers: fromNodeHeaders(req.headers),
      asResponse: true
    });

    // Extract headers, status, and body from the response
    const headers = Object.fromEntries(response.headers.entries());
    const status = response.status;
    const body = await response.json().catch(() => ({}));

    // Set any cookies or headers from the response
    Object.entries(headers).forEach(([key, value]) => {
      if (key.toLowerCase() === "set-cookie" && value) {
        res.setHeader("Set-Cookie", value);
      }
    });

    return res.status(status).json(body);
  } catch (error: any) {
    console.error("Sign out error:", error);
    return res.status(500).json({ message: error.message || "An error occurred during sign out" });
  }
};
