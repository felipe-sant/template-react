import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import { AppRoutes } from "@/routers/Router"

describe("AppRoutes", () => {
    it("renderiza a página de NotFound em uma rota inexistente", () => {
        render(
            <MemoryRouter initialEntries={["/rota-que-nao-existe"]}>
                <AppRoutes />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "404 - Not Found" })).toBeInTheDocument()
    })
})
