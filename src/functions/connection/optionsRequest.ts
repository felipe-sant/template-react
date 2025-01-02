import ErrorMessage from "../../types/ErrorMessage";

async function optionsRequest(url: string, query?: Record<string, string>): Promise<Headers | ErrorMessage> {
    try {
        let fullUrl: string;
        query ? fullUrl = `${url}?${(new URLSearchParams(query)).toString()}` : fullUrl = url;
        const response = await fetch(fullUrl, {
            method: "OPTIONS",
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.headers;
    } catch (error) {
        console.error("Erro:", error);
        return { error: (error as Error).message };
    }
}

export default optionsRequest;