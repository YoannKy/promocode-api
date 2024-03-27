import { validateSync } from 'class-validator';
import { DomainValidationError } from '../errors/domain-validation.error';

/**
 * This class is used to validate an object against class validator
 */
export class Validator<T> {
  constructor(object: Omit<T, 'validate'>) {
    Object.assign(this, object);
    this.validate();
  }

  /**
   * Throw if at least one error is returned by class validator
   */
  protected validate(): void {
    const errors = validateSync(this, {
      skipMissingProperties: true,
      forbidUnknownValues: true,
      
    });

    if (errors.length > 0) {
      throw new DomainValidationError(
        errors
          .map((error) => {
            return Object.values(error.constraints);
          })
          .toString(),
      );
    }
  }
}
