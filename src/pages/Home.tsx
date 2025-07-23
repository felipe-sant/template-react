import { useSelector } from "react-redux"
import css from "../styles/pages/home.module.css"
import { AppDispatch, RootState } from "../store/store"
import { setName } from "../store/reducers/example.reducer"
import { useDispatch } from "react-redux"

function Home() {
    const dispatch = useDispatch<AppDispatch>()
    const { name } = useSelector((state: RootState) => state.example)

    return (
        <main className={css.main}>
            <h1>{name}</h1>
            <input
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch(setName(e.target.value))}
            />
        </main>
    )
}

export default Home