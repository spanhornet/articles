import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth";
import { APIError } from "better-auth/api";

export const getUser = async (req: Request, res: Response) => {
  try {
    // Use Better-Auth to get the session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // If no session, return unauthorized
    if (!session || !session.user) {
      return res.status(401).json({
        title: "Authentication Required",
        message: "You must be logged in to access this resource",
        details: { reason: "no_session" }
      });
    }

    // Return the user from the session
    return res.status(200).json({
      title: "User Retrieved",
      message: "User information retrieved successfully",
      user: session.user
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    
    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to retrieve user information",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: "An error occurred while retrieving user information",
      details: process.env.NODE_ENV === 'development' ? { error: error.message } : undefined
    });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe = true } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "Email and password are required",
        details: {
          missingFields: [
            !email && "email",
            !password && "password"
          ].filter(Boolean)
        }
      });
    }

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

    // If the response is successful, add success title and message
    if (response.ok) {
      return res.status(status).json({
        title: "Sign In Successful",
        message: body.user ? `Welcome back, ${body.user.name || 'user'}!` : "You have been signed in successfully",
        ...body
      });
    }

    // If the response is not successful, add error title and message
    return res.status(status).json({
      title: "Sign In Failed",
      message: body.message || "Failed to sign in with the provided credentials",
      details: body.details || { reason: "invalid_credentials" },
      ...body
    });
  } catch (error: any) {
    console.error("Sign in error:", error);
    
    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Authentication Error",
        message: error.message || "Failed to sign in",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: error.message || "An error occurred during sign in",
      details: process.env.NODE_ENV === 'development' ? { error: error.stack } : undefined
    });
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

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        title: "Invalid Input",
        message: "Please provide all required fields",
        details: {
          missingFields: [
            !firstName && "firstName",
            !lastName && "lastName",
            !email && "email",
            !password && "password"
          ].filter(Boolean)
        }
      });
    }

    // Use Better-Auth to sign up
    const response = await auth.api.signUpEmail({
      body: {
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        phone,
        password,
      },
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

    // If the response is successful, add success title and message
    if (response.ok) {
      return res.status(status).json({
        title: "Sign Up Successful",
        message: `Welcome, ${firstName}! Your account has been created successfully.`,
        ...body
      });
    }

    // Handle specific error cases based on status code
    let errorTitle = "Sign Up Failed";
    let errorMessage = body.message || "Failed to create account";
    let errorDetails = body.details || {};

    // Add more specific error messages based on status
    if (status === 409) {
      errorTitle = "Account Already Exists";
      errorMessage = "An account with this email already exists";
      errorDetails = { ...errorDetails, reason: "email_exists" };
    } else if (status === 400) {
      errorTitle = "Invalid Input";
      errorMessage = body.message || "The provided information is invalid";
    }

    return res.status(status).json({
      title: errorTitle,
      message: errorMessage,
      details: errorDetails,
      ...body
    });
  } catch (error: any) {
    console.error("Sign up error:", error);
    
    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Sign Up Error",
        message: error.message || "Failed to create account",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: error.message || "An error occurred during sign up",
      details: process.env.NODE_ENV === 'development' ? { error: error.stack } : undefined
    });
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

    // If the response is successful, add success title and message
    if (response.ok) {
      return res.status(status).json({
        title: "Sign Out Successful",
        message: "You have been signed out successfully",
        ...body
      });
    }

    // If the response is not successful, add error title and message
    return res.status(status).json({
      title: "Sign Out Failed",
      message: body.message || "Failed to sign out",
      details: body.details || { reason: "unknown" },
      ...body
    });
  } catch (error: any) {
    console.error("Sign out error:", error);
    
    // Handle specific errors from Better-Auth
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        title: "Sign Out Error",
        message: error.message || "Failed to sign out",
        details: { errorCode: error.statusCode, errorType: error.status }
      });
    }

    // Generic error handler
    return res.status(500).json({
      title: "Server Error",
      message: error.message || "An error occurred during sign out",
      details: process.env.NODE_ENV === 'development' ? { error: error.stack } : undefined
    });
  }
};