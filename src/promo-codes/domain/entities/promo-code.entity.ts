import { IsDefined, IsString, ValidateNested } from 'class-validator';
import { Advantage } from './advantage';
import { Restriction } from './restriction';
import { Validator } from './validator';

/**
 * A promocode is an advantage that can be redeemed by a user if the name of the promocode exists and the condtiions are met
 */
export class PromoCode extends Validator<PromoCode> {
  /**
   * A promocode can be restricted to a set of conditions
   */
  @ValidateNested()
  public restrictions?: Restriction[];

  /**
   * A promocode is identified by its name
   */
  @IsString({
    message: 'Name must be a valid string',
  })
  @IsDefined({
    message: 'Name is required',
  })
  public name: string;

  /**
   * Once redemeed the promocode will offer a discount
   */
  @ValidateNested()
  @IsDefined({
    message: 'Advantage is required',
  })
  public advantage: Advantage;
}
