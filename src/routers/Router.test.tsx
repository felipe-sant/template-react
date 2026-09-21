import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

    it("navega da NotFound para a Home ao clicar no link, sem full reload", () => {
        render(
            <MemoryRouter initialEntries={["/rota-que-nao-existe"]}>
                <AppRoutes />
            </MemoryRouter>
        )

        userEvent.click(screen.getByRole("link", { name: "Vá para a página inicial." }))

        expect(screen.getByRole("heading", { name: "Hello World!" })).toBeInTheDocument()
    })
})
