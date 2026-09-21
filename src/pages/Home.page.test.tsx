import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import HomePage from "@/pages/Home.page"

describe("HomePage", () => {
    it("renderiza o título principal", () => {
        render(<HomePage />)

        expect(screen.getByRole("heading", { name: "Hello World!" })).toBeInTheDocument()
    })

    it("define título e meta description da página no head", () => {
        render(<HomePage />)

        expect(document.title).toBe("Título da Página")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Minha descrição personalizada.",
        )
    })
})
