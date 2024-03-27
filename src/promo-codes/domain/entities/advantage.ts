import { IsDefined, IsNumber } from 'class-validator';
import { Validator } from './validator';

/**
 * An advantage stands for the discount linked to the promocode
 */
export class Advantage extends Validator<Advantage> {
  /**
   * Stands for the discount percentage
   * "ie 15% discount"
   *
   */
  @IsNumber({}, { message: 'Percent must be a valid number' })
  @IsDefined()
  percent: number;
}
