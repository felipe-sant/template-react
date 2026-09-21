import Button from "@/components/Button"
import css from "@/styles/pages/home.module.css"

function HomePage() {
    return (
        <>
            <title>Título da Página</title>
            <meta name="description" content="Minha descrição personalizada." />
            <main className={css.main}>
                <h1>Hello World!</h1>
                <Button label="Botão de exemplo" onClick={() => alert("Botão de exemplo clicado.")} />
            </main>
        </>
    )
}

export default HomePage
