import { toast } from "sonner";

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set in the environment variables");
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

export async function fetchApi<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    console.log(response);

    // Try to parse the response as JSON
    let data = null;
    let error = null;
    
    try {
      data = await response.json();
    } catch (e) {
      // Response was not JSON
    }

    // Handle error responses
    if (!response.ok) {
      // Extract error message
      const errorMessage = 
        data?.message || 
        data?.error || 
        `Request failed with status: ${response.status}`;
      
      // Show toast notification
      toast.error(errorMessage);
      
      return {
        data: null,
        error: errorMessage,
        status: response.status
      };
    }

    // Success case
    return {
      data,
      error: null,
      status: response.status
    };
    
  } catch (error) {
    // Network errors or other exceptions
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    toast.error(`Network error: ${errorMessage}`);
    
    return {
      data: null,
      error: errorMessage,
      status: 0 // Use 0 to indicate network/client error
    };
  }
}