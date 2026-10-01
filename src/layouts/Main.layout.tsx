import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import css from "@/styles/layouts/main.module.css"

function MainLayout() {
    return (
        <div className={css.layout}>
            <header className={css.header}>
                <span>Header de exemplo</span>
            </header>
            <div className={css.content}>
                <Suspense fallback={<p>Carregando...</p>}>
                    <Outlet />
                </Suspense>
            </div>
            <footer className={css.footer}>
                <span>Footer de exemplo</span>
            </footer>
        </div>
    )
}

export default MainLayout
