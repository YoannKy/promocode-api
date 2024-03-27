import { Test, TestingModule } from '@nestjs/testing';
import {
  CheckPromoCodeQuery,
  CheckPromoCodeHandler,
  Status,
} from './check-promo-code.query';
import { CqrsModule } from '@nestjs/cqrs';
import { QueryModule } from '../query.module';
import { FakeDBModule } from '../../infrastructure/fake-db/fake-db.module';
import { WeatherApiService } from '../../infrastructure/weather-api/weather-api.service';
import { Weather } from '../../domain/entities/rules/weather-rule';
import { AjvModule } from '../../infrastructure/ajv/ajv.module';
import { WeatherApiModule } from '../../infrastructure/weather-api/weather-api.module';

describe('[INT] CheckPromoCodeQuery', () => {
  let handler: CheckPromoCodeHandler;
  let weatherApiService: WeatherApiService;
  let app: TestingModule;
  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        CqrsModule,
        QueryModule,
        FakeDBModule,
        AjvModule,
        WeatherApiModule,
      ],
      providers: [CheckPromoCodeHandler],
    }).compile();

    await app.init();

    handler = await app.resolve(CheckPromoCodeHandler);
    weatherApiService = await app.resolve(WeatherApiService);
  });

  beforeEach(() => jest.resetAllMocks());

  afterAll(async () => await app.close());

  it('should not throw if the Query is valid', async () => {
    const query = new CheckPromoCodeQuery('happy10', 40, 'lyon');

    jest.spyOn(weatherApiService, 'getCurrentWeather').mockResolvedValue({
      weather: Weather.RAIN,
      temp: 50,
    });

    const result = await handler.execute(query);
    expect(result.unwrap()).toEqual({
      status: Status.ACCEPTED,
      name: 'happy10',
      advantage: expect.objectContaining({ percent: 10 }),
    });
  });

  it('should throw if the restrictions are not matched', async () => {
    const query = new CheckPromoCodeQuery('happy10', 70, 'lyon');

    jest.spyOn(weatherApiService, 'getCurrentWeather').mockResolvedValue({
      weather: Weather.RAIN,
      temp: 50,
    });

    const result = await handler.execute(query);

    expect(result.unwrap()).toEqual({
      name: 'happy10',
      status: Status.DENIED,
      reasons: expect.stringContaining(
        'One of the conditions is not fulfilled',
      ),
    });
  });
});
