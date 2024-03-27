import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PromoCode } from '../../domain/entities/promo-code.entity';
import { Weather } from '../../domain/entities/rules/weather-rule';
import { Result } from '@badrap/result';
import { FakeDBService } from '../../infrastructure/fake-db/fake-db.service';
import { WeatherApiService } from '../../infrastructure/weather-api/weather-api.service';
import { ValidatorService } from '../../infrastructure/ajv/validator.service';
import { Logger } from '@nestjs/common';

export enum Status {
  ACCEPTED = 'Accepted',
  DENIED = 'Denied',
}

interface ResponseResult {
  status: Status;
  name: PromoCode['name'];
}

export interface AcceptedResult extends ResponseResult {
  advantage: PromoCode['advantage'];
}

export interface DeniedResult extends ResponseResult {
  reasons: string;
}

/**
 * Query to check a promoCode
 */
export class CheckPromoCodeQuery {
  constructor(
    public readonly name: PromoCode['name'],
    public readonly age?: number,
    public readonly town?: string,
  ) {}
}

@QueryHandler(CheckPromoCodeQuery)
export class CheckPromoCodeHandler
  implements IQueryHandler<CheckPromoCodeQuery>
{
  protected logger: Logger = new Logger(CheckPromoCodeHandler.name);
  constructor(
    protected fakeDBService: FakeDBService,
    protected weatherApiService: WeatherApiService,
    protected validatorService: ValidatorService,
  ) {}

  public async execute(
    query: CheckPromoCodeQuery,
  ): Promise<Result<AcceptedResult | DeniedResult>> {
    this.logger.log('Checking the promocode validity', { query });
    const promoCode = this.fakeDBService.findPromoCode(query.name);

    if (!promoCode) {
      return Result.ok({
        status: Status.DENIED,
        reasons: 'No promoCode with this name was found',
        name: query.name,
      });
    }

    this.logger.debug(
      'Found the requested promocode, proceeding to build a payload to validate the restrictions',
      { promoCode },
    );

    const payload: {
      date?: string;
      age?: number;
      weather?: { is: Weather; temp: number };
    } = {
      date: new Date().toISOString().substring(0, 10),
    };

    if (query.age) {
      payload.age = query.age;
    }

    if (query.town) {
      const result = await this.weatherApiService.getCurrentWeather(query.town);
      payload.weather = { is: result.weather as Weather, temp: result.temp };
    }

    this.logger.debug(
      'Built the payload, proceeding to validate the payload against the promocode restrictions',
      { promoCode, payload },
    );

    const result = this.validatorService.execute(promoCode, payload);
    if (result.isErr) {
      return Result.ok({
        status: Status.DENIED,
        reasons: result.error.message,
        name: query.name,
      });
    }

    this.logger.log('Restrictions have been validated', {
      promoCode,
      payload,
      result: result.unwrap(),
    });

    return Result.ok({
      status: Status.ACCEPTED,
      name: query.name,
      advantage: promoCode.advantage,
    });
  }
}
