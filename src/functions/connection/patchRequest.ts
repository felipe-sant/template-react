import axios from "axios";
import ErrorMessage from "../../types/ErrorMessage";

async function patchRequest<T, U>(url: string, body: U, query?: Record<string, string>): Promise<T | ErrorMessage> {
    try {
        const fullUrl = query
            ? `${url}?${new URLSearchParams(query).toString()}`
            : url;

        const response = await axios.patch<T>(fullUrl, body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error: any) {
        console.error("Erro:", error);
        return {
            error: error.response?.data?.error || error.message || 'Erro desconhecido',
        };
    }
}

export default patchRequest;