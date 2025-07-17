import axios from "axios";
import ErrorMessage from "../../types/ErrorMessage";

async function deleteRequest<T>(url: string, query?: Record<string, string>): Promise<T | ErrorMessage> {
    try {
        const fullUrl = query
            ? `${url}?${new URLSearchParams(query).toString()}`
            : url;

        const response = await axios.delete<T>(fullUrl, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error: any) {
        console.error("Error:", error);
        return {
            error: error.response?.data?.error || error.message || 'Erro desconhecido',
        };
    }
}

export default deleteRequest;