import { toast } from "sonner";

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set in the environment variables");
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Define response types
export type ApiSuccess<T> = {
  data: T;
  error: null;
  status: number;
  message?: string;
  title?: string;
};

export type ApiError = {
  data: null;
  error: {
    message: string;
    title?: string;
    details?: any;
  };
  status: number;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

type FetchOptions = RequestInit & {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successTitle?: string;
  successMessage?: string;
};

export async function fetchApi<T = any>(
  endpoint: string, 
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const {
    showSuccessToast = true,
    showErrorToast = true,
    successTitle = "Success",
    successMessage,
    ...fetchOptions
  } = options;
  
  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  };

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...fetchOptions,
    });

    // Parse response body
    let responseData;
    const contentType = response.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = text.length ? { message: text } : {};
    }

    // Success response
    if (response.ok) {
      // Extract success information
      const title = responseData.title || successTitle;
      const message = responseData.message || successMessage || "Operation completed successfully";
      
      // Show success toast if enabled
      if (showSuccessToast) {
        toast.success(title, {
          description: message,
        });
      }
      
      return {
        data: responseData,
        error: null,
        status: response.status,
        message,
        title
      };
    } else {
      // Extract error information
      const errorTitle = responseData?.title || "Error";
      const errorMessage = responseData?.message || responseData?.error || `Request failed with status: ${response.status}`;
      const errorDetails = responseData?.details;
      
      // Show error toast if enabled
      if (showErrorToast) {
        toast.error(errorTitle, {
          description: errorMessage,
        });
      }
      
      return {
        data: null,
        error: {
          message: errorMessage,
          title: errorTitle,
          details: errorDetails
        },
        status: response.status
      };
    }
  } catch (error) {
    // Network or other client-side errors
    const errorTitle = "Connection Error";
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred';
    
    // Show error toast if enabled
    if (showErrorToast) {
      toast.error(errorTitle, {
        description: errorMessage,
      });
    }
    
    return {
      data: null,
      error: {
        message: errorMessage,
        title: errorTitle
      },
      status: 0 // Use 0 to indicate network/client error
    };
  }
}