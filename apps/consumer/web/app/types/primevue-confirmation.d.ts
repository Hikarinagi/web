export interface HikariConfirmDialogContext {
  close: () => void
}

declare module 'primevue/confirmationoptions' {
  interface ConfirmationOptions {
    closeOnEscape?: boolean
    countdown?: number | false
    loading?: () => boolean
    onAccept?: (context: HikariConfirmDialogContext) => void | Promise<void>
  }
}
