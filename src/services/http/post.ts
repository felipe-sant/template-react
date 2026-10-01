import parseResponse from "@/services/http/parseResponse"

async function post<T>(url: string, body: unknown): Promise<T> {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    return parseResponse<T>(response)
}

export default post
