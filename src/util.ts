export function getError(error: unknown) {
    if (error instanceof Error) return error
    return new Error()
}

export function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message
    return String(error)
}
