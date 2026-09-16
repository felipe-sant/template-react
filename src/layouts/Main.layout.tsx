import { Outlet } from "react-router-dom"
import css from "../styles/layouts/main.module.css"

// Layout de exemplo: existe para demonstrar a convenção de `src/layouts/`.
// Ainda não está registrado em nenhuma rota — a rota de layout é escopo da issue #24.
// Substitua ou remova no projeto real.
function MainLayout() {
    return (
        <div className={css.layout}>
            <header className={css.header}>
                <span>Header de exemplo</span>
            </header>
            <div className={css.content}>
                <Outlet />
            </div>
            <footer className={css.footer}>
                <span>Footer de exemplo</span>
            </footer>
        </div>
    )
}

export default MainLayout
