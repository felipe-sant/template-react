import { useSelector } from "react-redux"
import css from "../styles/pages/home.module.css"
import { AppDispatch, RootState } from "../store/store"
import { useDispatch } from "react-redux"

function Home() {
    const dispatch = useDispatch<AppDispatch>()

    return (
        <main className={css.main}>
            <h1>Hello World!</h1>
        </main>
    )
}

export default Home