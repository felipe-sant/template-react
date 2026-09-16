import css from "../styles/components/button.module.css"

// Componente de exemplo: existe para demonstrar a convenção de `src/components/`.
// Substitua ou remova no projeto real.
interface ButtonProps {
    label: string
    onClick?: () => void
}

function Button({ label, onClick }: ButtonProps) {
    return (
        <button type="button" className={css.button} onClick={onClick}>
            {label}
        </button>
    )
}

export default Button
