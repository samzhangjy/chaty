export class AckStatus {
  static success(msg?: string) {
    return { status: 'success', msg };
  }

  static error(cause?: string) {
    return {
      status: 'error',
      cause,
    };
  }
}
