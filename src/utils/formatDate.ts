// Utilitário de exemplo: existe para demonstrar a convenção de `src/utils/`.
// Substitua ou remova no projeto real.
export function formatDate(date: Date): string {
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
}
