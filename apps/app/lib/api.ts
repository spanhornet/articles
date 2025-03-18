export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    const response = await fetch(url, {
        ...defaultOptions,
        ...options,
    });

    return response;
}
