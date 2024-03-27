import { Injectable, Logger } from '@nestjs/common';
import { AjvRestriction } from './ajv-restriction';
import { PromoCode } from '../../domain/entities/promo-code.entity';
import Ajv from 'ajv';
import ajvError from 'ajv-errors';
import addFormats from 'ajv-formats';
import { Result } from '@badrap/result';

@Injectable()
/**
 * This service handles the json schema validation
 * by converting the domain restriction object into an AJV JSON schema
 */
export class ValidatorService {
  protected ajv: Ajv;
  protected logger: Logger = new Logger(ValidatorService.name);

  constructor() {
    this.ajv = new Ajv({ allErrors: true });

    addFormats(this.ajv);
    ajvError(this.ajv);
  }

  /**
   * Check if the context inside the payload (ie age, town weather, current date) matches
   * with the restrictions to redeem the promoCode
   * @param promoCode - the promocode that is requested
   * @param payload - the context regarding the user requesting the promoCode
   */
  public execute(promoCode: PromoCode, payload): Result<boolean | Error> {
    const { schema } = new AjvRestriction(promoCode.restrictions);

    this.logger.debug('Built DTO from domain restriction to ajvschema', {
      schema,
      restrictions: promoCode.restrictions,
    });

    const validate = this.ajv.compile(schema);
    this.logger.debug(
      'Compiled ajv schema, proceeding to validate the payload',
      {
        schema,
        payload,
      },
    );
    validate(payload);
    if (validate.errors?.length) {
      this.logger.debug('The payload did not match the schema expectations', {
        schema,
        payload,
      });
      return Result.err(
        new Error(
          validate.errors
            .map((error) => {
              if (error.keyword === 'anyOf') {
                return 'One of the conditions is not fulfilled';
              }

              if (error.keyword === 'allOf') {
                return 'All the conditions must be fulfilled';
              }

              return error.message;
            })
            .toString(),
        ),
      );
    }

    this.logger.log('The payload has been validated by the schema', {
      schema,
      payload,
    });
    return Result.ok(true);
  }
}
