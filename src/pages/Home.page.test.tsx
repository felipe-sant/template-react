import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import HomePage from "@/pages/Home.page"

describe("HomePage", () => {
    it("renderiza o título principal", () => {
        render(<HomePage />)

        expect(screen.getByRole("heading", { name: "Hello World!" })).toBeInTheDocument()
    })
})
