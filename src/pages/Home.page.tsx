import Button from "../components/Button"
import css from "../styles/pages/home.module.css"

function HomePage() {
    return (
        <main className={css.main}>
            <h1>Hello World!</h1>
            {/* Uso de exemplo do componente Button — descartável, remova no projeto real. */}
            <Button label="Botão de exemplo" onClick={() => alert("Botão de exemplo clicado.")} />
        </main>
    )
}

export default HomePage
