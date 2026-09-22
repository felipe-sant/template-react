import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import ExampleListPage from "@/pages/ExampleList.page"
import { get } from "@/services/http.service"
import type { ExampleEntity } from "@/types/example.types"

vi.mock("@/services/http.service", () => ({
    get: vi.fn()
}))

const mockedGet = vi.mocked(get)

function createExampleEntity(overrides: Partial<ExampleEntity> = {}): ExampleEntity {
    return {
        id: "1",
        name: "Exemplo A",
        active: true,
        createdAt: "2024-01-15T12:00:00.000Z",
        ...overrides
    }
}

describe("ExampleListPage", () => {
    it("mostra o estado de carregando antes da resposta chegar", () => {
        mockedGet.mockReturnValueOnce(new Promise(() => {}))

        render(<ExampleListPage />)

        expect(screen.getByText("Carregando exemplos...")).toBeInTheDocument()
    })

    it("mostra o nome e a data formatada de cada exemplo ao carregar com sucesso", async () => {
        mockedGet.mockResolvedValueOnce([createExampleEntity()])

        render(<ExampleListPage />)

        expect(await screen.findByText("Exemplo A")).toBeInTheDocument()
        expect(screen.getByText("15/01/2024")).toBeInTheDocument()
    })

    it("mostra a mensagem de lista vazia quando não há exemplos", async () => {
        mockedGet.mockResolvedValueOnce([])

        render(<ExampleListPage />)

        expect(await screen.findByText("Nenhum exemplo encontrado.")).toBeInTheDocument()
        expect(screen.queryByText("Carregando exemplos...")).not.toBeInTheDocument()
    })

    it("mostra uma mensagem de alerta quando a busca falha", async () => {
        mockedGet.mockRejectedValueOnce(new Error("Falha ao buscar exemplos."))

        render(<ExampleListPage />)

        expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao buscar exemplos.")
        expect(screen.queryByRole("list")).not.toBeInTheDocument()
    })

    it("não lança erro nem warning ao resolver a busca após o componente desmontar", async () => {
        let resolveGet!: (entities: ExampleEntity[]) => void
        mockedGet.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveGet = resolve
            })
        )
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

        const { unmount } = render(<ExampleListPage />)
        unmount()
        resolveGet([createExampleEntity()])
        await Promise.resolve()

        expect(errorSpy).not.toHaveBeenCalled()
        expect(warnSpy).not.toHaveBeenCalled()

        errorSpy.mockRestore()
        warnSpy.mockRestore()
    })
})
