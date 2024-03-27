import { Test, TestingModule } from '@nestjs/testing';
import { PromoCodeController } from './promo-code.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { Weather } from '../domain/entities/rules/weather-rule';
import { CreatePromoCodeHandler } from '../commands/create-promo-code/create-promo-code.command';
import { PromoCodeBody } from './promo-code.types';
import { CommandModule } from '../commands/command.module';
import { QueryModule } from '../queries/query.module';
import { FakeDBModule } from '../infrastructure/fake-db/fake-db.module';
import { FakeDBService } from '../infrastructure/fake-db/fake-db.service';

describe('[INT] PromoCodeController', () => {
  let promoCodeController: PromoCodeController;
  let fakeDBService: FakeDBService;
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [CqrsModule, CommandModule, QueryModule, FakeDBModule],
      controllers: [PromoCodeController],
      providers: [CreatePromoCodeHandler],
    }).compile();

    await app.init();

    promoCodeController = await app.resolve(PromoCodeController);
    fakeDBService = await app.resolve(FakeDBService);
  });

  afterEach(() => jest.resetAllMocks());

  afterAll(async () => await app.close());

  describe('create', () => {
    it('should insert the promoCode in the fakeDBSService', async () => {
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
      const result = await promoCodeController.create(payload);
      expect(result).toEqual({
        advantage: { percent: 50 },
        name: 'test',
        restrictions: [
          { date: { after: '2022-09-12', before: '2022-12-12' } },
          {
            or: [
              { age: { eq: 40 } },
              {
                and: [
                  { age: { gt: 15, lt: 30 } },
                  { weather: { is: 'Clear', temp: { gt: 15 } } },
                ],
              },
            ],
          },
        ],
      });

      const promoCode = fakeDBService.findPromoCode('test');
      expect(promoCode).toBeDefined();
    });
  });

  describe('checkValidity', () => {
    it('should find the promoCode and validate', async () => {
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
      const result = await promoCodeController.create(payload);
      expect(result).toEqual({
        advantage: { percent: 50 },
        name: 'test',
        restrictions: [
          { date: { after: '2022-09-12', before: '2022-12-12' } },
          {
            or: [
              { age: { eq: 40 } },
              {
                and: [
                  { age: { gt: 15, lt: 30 } },
                  { weather: { is: 'Clear', temp: { gt: 15 } } },
                ],
              },
            ],
          },
        ],
      });

      const promoCode = fakeDBService.findPromoCode('test');
      expect(promoCode).toBeDefined();
    });
  });
});
