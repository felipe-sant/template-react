import { useCallback, useState } from "react"

// Hook de exemplo: existe para demonstrar a convenção de `src/hooks/`.
// Substitua ou remova no projeto real.
export function useToggle(initial: boolean = false): [boolean, () => void] {
    const [value, setValue] = useState<boolean>(initial)

    const toggle = useCallback(() => {
        setValue((atual) => !atual)
    }, [])

    return [value, toggle]
}
