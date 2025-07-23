import useAppDispatch from "../hooks/useAppDispatch"
import css from "../styles/pages/home.module.css"

function Home() {
    const dispatch = useAppDispatch()

    return (
        <main className={css.main}>
            <h1>Hello world</h1>
        </main>
    )
}

export default Home