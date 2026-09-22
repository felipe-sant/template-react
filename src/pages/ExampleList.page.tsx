import { formatDate } from "@/utils/formatDate"
import { useExampleList } from "@/pages/hooks/useExampleList"
import css from "@/styles/pages/exampleList.module.css"

function ExampleListPage() {
    const state = useExampleList()

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
