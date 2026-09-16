// Service de exemplo: existe para demonstrar a convenção de `src/services/`.
// Wrapper genérico sobre o `fetch` nativo, sem endpoint real — a URL completa é
// sempre parâmetro. Substitua ou remova no projeto real.

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`Requisição falhou com status ${response.status}.`)
    }
    return (await response.json()) as T
}

export async function get<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
    })
    return parseResponse<T>(response)
}

export async function post<T>(url: string, body: unknown): Promise<T> {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
    return parseResponse<T>(response)
}
