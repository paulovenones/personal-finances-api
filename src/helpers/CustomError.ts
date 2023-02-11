export class CustomError extends Error {
  public statusCode: number;

  constructor(message: string, code: number) {
    super(message);
    this.statusCode = code;
  }
}
