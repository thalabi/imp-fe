export interface UploadResponse {
    numberOfLinesInFile: number
    numberOfValidLines: number
    totalNumberOfExceptions: number
    numberOfLinesWitheExceptions: number
    elapsedTime: string
    exceptionsFileName: string
}