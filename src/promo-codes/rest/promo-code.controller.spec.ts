import { PromoCodeController } from './promo-code.controller';
import { Weather } from '../domain/entities/rules/weather-rule';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CheckPromoCodeQuery } from '../queries/check-promo-code/check-promo-code.query';
import { PromoCodeBody } from './promo-code.types';
import { Result } from '@badrap/result';

const { CommandBus: MockCommandBus, QueryBus: MockQueryBus } =
  jest.genMockFromModule<{ CommandBus; QueryBus }>('@nestjs/cqrs');

describe('[UT] PromoCodeController', () => {
  afterEach(() => jest.resetAllMocks());

  const commandBus: jest.Mocked<CommandBus> = new MockCommandBus();
  const queryBus: jest.Mocked<QueryBus> = new MockQueryBus();
  const promoCodeController = new PromoCodeController(commandBus, queryBus);

  describe('create', () => {
    it('should call commandBus with the right parameters', async () => {
      const payload: PromoCodeBody = {
        name: 'test',
        advantage: { percent: 50 },
        age: null,
        date: { before: '2022-12-12', after: '2022-09-12' },
        weather: null,
        and: [],
        or: [
          {
            age: { eq: 40 },
          },
          {
            and: [
              {
                age: {
                  gt: 15,
                  lt: 30,
                },
                weather: {
                  is: Weather.CLEAR,
                  temp: { gt: 15 },
                },
              },
            ],
          },
        ],
      };

      commandBus.execute.mockResolvedValue(Result.ok({}));
      await promoCodeController.create(payload);
      expect(commandBus.execute).toHaveBeenCalledWith(payload);
    });
  });

  describe('checkValidity', () => {
    it('should call queryBus with the right parameters', async () => {
      const payload = {
        age: 25,
        town: 'lyon',
        name: 'happy10',
      };

      queryBus.execute.mockResolvedValue(Result.ok({}));
      await promoCodeController.checkValidity(payload);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new CheckPromoCodeQuery(payload.name, payload.age, payload.town),
      );
    });
  });
});
