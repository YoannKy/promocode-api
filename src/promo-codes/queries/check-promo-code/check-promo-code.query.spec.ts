import {
  CheckPromoCodeQuery,
  CheckPromoCodeHandler,
  Status,
} from './check-promo-code.query';
import { Weather, WeatherRule } from '../../domain/entities/rules/weather-rule';
import { WeatherApiService } from '../../infrastructure/weather-api/weather-api.service';
import { FakeDBService } from '../../infrastructure/fake-db/fake-db.service';
import { PromoCode } from '../../domain/entities/promo-code.entity';
import { Advantage } from '../../domain/entities/advantage';
import { Restriction } from '../../domain/entities/restriction';
import { DateRule } from '../../domain/entities/rules/date-rule';
import { Rule } from '../../domain/entities/rules/rule';
import { ValidatorService } from '../../infrastructure/ajv/validator.service';
import { Result } from '@badrap/result';

const { FakeDBService: MockFakeDBService } = jest.genMockFromModule<{
  FakeDBService;
}>('../../infrastructure/fake-db/fake-db.service');

const { WeatherApiService: MockWeatherApiService } = jest.genMockFromModule<{
  WeatherApiService;
}>('../../infrastructure/weather-api/weather-api.service');

const { ValidatorService: MockValidatorService } = jest.genMockFromModule<{
  ValidatorService;
}>('../../infrastructure/ajv/validator.service');

describe('[UT] CheckPromoCodeQuery', () => {
  const fakeDBService: jest.Mocked<FakeDBService> = new MockFakeDBService();
  const weatherApiService: jest.Mocked<WeatherApiService> =
    new MockWeatherApiService();
  const validatorService: jest.Mocked<ValidatorService> =
    new MockValidatorService();
  const handler: CheckPromoCodeHandler = new CheckPromoCodeHandler(
    fakeDBService,
    weatherApiService,
    validatorService,
  );
  const promoCode = new PromoCode({
    name: 'happy10',
    advantage: new Advantage({ percent: 10 }),
    restrictions: [
      new Restriction({
        date: new DateRule({
          after: '2024-03-20',
          before: '2024-04-22',
        }),
      }),
      new Restriction({
        or: [
          new Restriction({
            age: new Rule({ eq: 40 }),
          }),
          new Restriction({
            and: [
              new Restriction({
                age: new Rule({
                  lt: 30,
                  gt: 15,
                }),
              }),
              new Restriction({
                weather: new WeatherRule({
                  is: Weather.ASH,
                  temp: new Rule({ gt: 15 }),
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  });

  afterEach(() => jest.resetAllMocks());

  it('should not throw if the Query is valid', async () => {
    const query = new CheckPromoCodeQuery('happy10', 40, 'lyon');

    weatherApiService.getCurrentWeather.mockResolvedValue({
      weather: Weather.RAIN,
      temp: 50,
    });

    validatorService.execute.mockReturnValue(Result.ok(true));

    fakeDBService.findPromoCode.mockReturnValue(promoCode);

    const result = await handler.execute(query);
    expect(result.unwrap()).toEqual({
      status: Status.ACCEPTED,
      name: 'happy10',
      advantage: expect.objectContaining({ percent: 10 }),
    });

    expect(weatherApiService.getCurrentWeather).toHaveBeenCalledWith('lyon');
    expect(fakeDBService.findPromoCode).toHaveBeenCalledWith('happy10');
    expect(validatorService.execute).toHaveBeenCalledWith(promoCode, {
      date: expect.anything(),
      age: 40,
      weather: { is: Weather.RAIN, temp: 50 },
    });
  });

  it('should not throw if the Query is valid (no age and town provided)', async () => {
    const query = new CheckPromoCodeQuery('happy10');

    weatherApiService.getCurrentWeather.mockResolvedValue({
      weather: Weather.RAIN,
      temp: 50,
    });

    validatorService.execute.mockReturnValue(Result.ok(true));

    fakeDBService.findPromoCode.mockReturnValue(promoCode);

    const result = await handler.execute(query);
    expect(result.unwrap()).toEqual({
      status: Status.ACCEPTED,
      name: 'happy10',
      advantage: expect.objectContaining({ percent: 10 }),
    });

    expect(weatherApiService.getCurrentWeather).not.toHaveBeenCalledWith();
    expect(fakeDBService.findPromoCode).toHaveBeenCalledWith('happy10');
    expect(validatorService.execute).toHaveBeenCalledWith(promoCode, {
      date: expect.anything(),
    });
  });

  it('should throw if the restrictions are not matched', async () => {
    const query = new CheckPromoCodeQuery('happy10', 70, 'lyon');

    weatherApiService.getCurrentWeather.mockResolvedValue({
      weather: Weather.RAIN,
      temp: 50,
    });

    validatorService.execute.mockReturnValue(
      Result.err(new Error('One of the conditions is not fulfilled')),
    );

    fakeDBService.findPromoCode.mockReturnValue(promoCode);

    const result = await handler.execute(query);

    expect(result.unwrap()).toEqual({
      name: 'happy10',
      status: Status.DENIED,
      reasons: expect.stringContaining(
        'One of the conditions is not fulfilled',
      ),
    });
    expect(weatherApiService.getCurrentWeather).toHaveBeenCalledWith('lyon');
    expect(fakeDBService.findPromoCode).toHaveBeenCalledWith('happy10');
    expect(validatorService.execute).toHaveBeenCalledWith(promoCode, {
      date: expect.anything(),
      age: 70,
      weather: { is: Weather.RAIN, temp: 50 },
    });
  });
});
