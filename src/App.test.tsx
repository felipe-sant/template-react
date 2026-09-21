import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import App from "@/App"

describe("App", () => {
    it("renderiza a página inicial na rota raiz", () => {
        render(<App />)

        expect(screen.getByRole("heading", { name: "Hello World!" })).toBeInTheDocument()
    })

    it("define título e meta description da página no head", () => {
        render(<App />)

        expect(document.title).toBe("Título da Página")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Minha descrição personalizada.",
        )
    })

    it("usa o título e a meta description de NotFound.page numa rota desconhecida", () => {
        window.history.pushState({}, "", "/rota-que-nao-existe")

        render(<App />)

        expect(document.title).toBe("Página não encontrada.")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "A página não existe ou você não possui acesso.",
        )
    })
})
