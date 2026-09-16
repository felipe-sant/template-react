import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import App from "@/App"

describe("App", () => {
    it("renderiza a página inicial na rota raiz", () => {
        render(<App />)

        expect(screen.getByRole("heading", { name: "Hello World!" })).toBeInTheDocument()
    })
})
