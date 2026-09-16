import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Button from "@/components/Button"

afterEach(cleanup)

describe("Button", () => {
    it("renderiza o label recebido", () => {
        render(<Button label="Botão de exemplo" />)

        expect(screen.getByRole("button", { name: "Botão de exemplo" })).toBeInTheDocument()
    })

    it("dispara o onClick ao ser clicado", () => {
        const onClick = vi.fn()
        render(<Button label="Botão de exemplo" onClick={onClick} />)

        userEvent.click(screen.getByRole("button", { name: "Botão de exemplo" }))

        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
