export class DomainValidationError extends Error {
  constructor(message: string) {
    super(`Validation error: ${message}`);
  }
}
