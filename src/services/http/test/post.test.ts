import { afterEach, describe, expect, it, vi } from "vitest"
import post from "@/services/http/post"

function mockFetch(response: Partial<Response>) {
    const fetchMock = vi.fn().mockResolvedValue(response as Response)
    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("post", () => {
    it("serializa o corpo enviado e informa o Content-Type", async () => {
        const fetchMock = mockFetch({ ok: true, json: async () => ({ id: "1" }) })

        await post("/api/example", { name: "Exemplo" })

        expect(fetchMock).toHaveBeenCalledWith("/api/example", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: '{"name":"Exemplo"}'
        })
    })

    it("lança um erro com o status quando a resposta não é ok", async () => {
        mockFetch({ ok: false, status: 500, json: async () => ({}) })

        await expect(post("/api/example", {})).rejects.toThrow("Requisição falhou com status 500.")
    })
})
