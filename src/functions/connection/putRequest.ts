import ErrorMessage from "../../types/ErrorMessage";

async function putRequest<T, U>(url: string, body: U, query?: Record<string, string>): Promise<T | ErrorMessage> {
    try {
        let fullUrl: string
        query ? fullUrl = `${url}?${(new URLSearchParams(query)).toString()}` : fullUrl = url
        const response = await fetch(fullUrl, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: T = await response.json();
        return data;
    } catch (error) {
        console.error("Erro:", error);
        return { error: (error as Error).message };
    }
}

export default putRequest;