import { Helmet } from "react-helmet"
import css from "@/styles/pages/notFound.module.css"

function NotFoundPage() {
    return (
        <>
            <Helmet>
                <title>Página não encontrada.</title>
                <meta name="description" content="A página não existe ou você não possui acesso." />
            </Helmet>
            <main className={css.main}>
                <div>
                    <h1>404 - Not Found</h1>
                    <p><a href="/">Vá para a página inicial.</a></p>
                </div>
            </main>
        </>
    )
}

export default NotFoundPage