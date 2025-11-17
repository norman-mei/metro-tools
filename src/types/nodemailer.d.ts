declare module 'nodemailer' {
  interface TransportOptions {
    // Use loose typing to avoid pulling full nodemailer type dependency at build time
    [key: string]: unknown
  }

  interface Transporter {
    sendMail(options: Record<string, unknown>): Promise<unknown>
  }

  function createTransport(options: TransportOptions): Transporter

  const nodemailer: {
    createTransport: typeof createTransport
  }

  export { createTransport, TransportOptions, Transporter }
  export default nodemailer
}
