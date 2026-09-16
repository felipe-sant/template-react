import { useCallback, useState } from "react"

export function useToggle(initial: boolean = false): [boolean, () => void] {
    const [value, setValue] = useState<boolean>(initial)

    const toggle = useCallback(() => {
        setValue((atual) => !atual)
    }, [])

    return [value, toggle]
}
