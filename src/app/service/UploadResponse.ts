export interface UploadResponse {
    beansLoadedInParallel: number
    parallelElapsedTime: string
    beansLoadedSequentially: number
    sequentiallElapsedTime: string
    beansLoadedUsingStream: number
    streamElapsedTime: string
}