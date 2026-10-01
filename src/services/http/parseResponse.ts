async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`Requisição falhou com status ${response.status}.`)
    }
    return (await response.json()) as T
}

export default parseResponse
