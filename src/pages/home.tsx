import buscarDados from "../functions/buscarDados"

export default function Home() {
    const pegarDados = async () => {
        const result = await buscarDados('http://localhost:5000/Produtos')
        console.log(result)
    }

    return (
        <main>
            <h1>Hello world</h1>
            <button onClick={pegarDados}>PEGAR DADOS</button>
        </main>
    )
}