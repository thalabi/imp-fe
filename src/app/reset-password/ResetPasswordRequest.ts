export interface ResetPasswordRequest {
    resetPasswordJwt: string
    newPassword: string
    baseUrl: string
}