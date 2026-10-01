import { describe, expect, it } from "vitest"
import getLanguage from "@/i18n/getLanguage"
import i18n from "@/i18n/i18n"

describe("getLanguage", () => {
    it.each(["pt-BR", "en", "es"] as const)(
        "devolve %s depois da troca de idioma",
        async (language) => {
            await i18n.changeLanguage(language)

            expect(getLanguage()).toBe(language)
        }
    )

    it("devolve en quando o idioma resolvido não é suportado", () => {
        i18n.resolvedLanguage = "fr"

        expect(getLanguage()).toBe("en")
    })

    it("devolve en quando não há idioma resolvido", () => {
        i18n.resolvedLanguage = undefined

        expect(getLanguage()).toBe("en")
    })
})
