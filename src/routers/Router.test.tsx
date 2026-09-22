import { describe, expect, it } from "vitest"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { routes } from "@/routers/Router"

function renderRoutes(initialEntries: string[]) {
    const router = createMemoryRouter(routes, { initialEntries })
    return render(<RouterProvider router={router} />)
}

describe("routes", () => {
    it("mostra o fallback de carregamento antes da página lazy resolver", () => {
        renderRoutes(["/"])

        expect(screen.getByText("Carregando...")).toBeInTheDocument()
    })

    it("renderiza o header e o footer do MainLayout ao redor da página em uma rota válida", async () => {
        renderRoutes(["/"])

        expect(await screen.findByRole("heading", { name: "Hello World!" })).toBeInTheDocument()
        expect(screen.getByRole("banner")).toBeInTheDocument()
        expect(screen.getByRole("contentinfo")).toBeInTheDocument()
    })

    it("renderiza a página de NotFound em uma rota inexistente", async () => {
        renderRoutes(["/rota-que-nao-existe"])

        expect(await screen.findByRole("heading", { name: "404 - Not Found" })).toBeInTheDocument()
    })

    it("navega da NotFound para a Home ao clicar no link, sem full reload", async () => {
        renderRoutes(["/rota-que-nao-existe"])

        await screen.findByRole("link", { name: "Vá para a página inicial." })
        userEvent.click(screen.getByRole("link", { name: "Vá para a página inicial." }))

        expect(await screen.findByRole("heading", { name: "Hello World!" })).toBeInTheDocument()
    })
})
