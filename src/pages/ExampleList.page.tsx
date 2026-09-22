import { useEffect, useState } from "react"
import { get } from "@/services/http.service"
import { formatDate } from "@/utils/formatDate"
import type { ExampleEntity } from "@/types/example.types"
import css from "@/styles/pages/exampleList.module.css"

type ExampleListState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "success"; entities: ExampleEntity[] }

function ExampleListPage() {
    const [state, setState] = useState<ExampleListState>({ status: "loading" })

    useEffect(() => {
        let isMounted = true

        get<ExampleEntity[]>("/mock/example-entities.json")
            .then((entities) => {
                if (isMounted) {
                    setState({ status: "success", entities })
                }
            })
            .catch((error: unknown) => {
                if (isMounted) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar os exemplos."
                    setState({ status: "error", message })
                }
            })

        return () => {
            isMounted = false
        }
    }, [])

    return (
        <>
            <title>Exemplos integrados</title>
            <meta
                name="description"
                content="Lista de exemplos consumida via http.service, formatada com formatDate."
            />
            <main className={css.main}>
                <h1>Exemplos integrados</h1>
                {state.status === "loading" && <p>Carregando exemplos...</p>}
                {state.status === "error" && (
                    <p role="alert" className={css.error}>
                        {state.message}
                    </p>
                )}
                {state.status === "success" &&
                    (state.entities.length === 0 ? (
                        <p>Nenhum exemplo encontrado.</p>
                    ) : (
                        <ul className={css.list}>
                            {state.entities.map((entity) => (
                                <li key={entity.id} className={css.item}>
                                    <span className={css.name}>{entity.name}</span>
                                    <span className={css.date}>
                                        {formatDate(new Date(entity.createdAt))}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ))}
            </main>
        </>
    )
}

export default ExampleListPage
