import parseResponse from "@/services/http/parseResponse"

async function get<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" }
    })
    return parseResponse<T>(response)
}

export default get
