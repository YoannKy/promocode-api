import { Weather } from '../../domain/entities/rules/weather-rule';
import {
  CreatePromoCodeCommand,
  CreatePromoCodeHandler,
} from './create-promo-code.command';
import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandModule } from '../command.module';
import { FakeDBModule } from '../../infrastructure/fake-db/fake-db.module';
import { FakeDBService } from '../../infrastructure/fake-db/fake-db.service';

describe('[INT] CreatePromoCodeCommand', () => {
  let handler: CreatePromoCodeHandler;
  let app: TestingModule;
  let fakeDBService: FakeDBService;
  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [CqrsModule, CommandModule, FakeDBModule],
      providers: [CreatePromoCodeHandler],
    }).compile();

    await app.init();

    handler = await app.resolve(CreatePromoCodeHandler);
    fakeDBService = await app.resolve(FakeDBService);
  });

  afterEach(() => jest.resetAllMocks());

  afterAll(async () => await app.close());

  it('should insert the promoCode if the command is valid', async () => {
    const command = new CreatePromoCodeCommand(
      'test',
      { percent: 50 },
      undefined,
      { before: '2022-12-12', after: '2022-09-12' },
      undefined,
      [],
      [
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
    );

    const result = await handler.execute(command);

    const promoCode = {
      name: 'test',
      advantage: { percent: 50 },
      restrictions: [
        { date: { before: '2022-12-12', after: '2022-09-12' } },
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
    };

    const promoCodeDB = fakeDBService.findPromoCode('test');

    expect(promoCodeDB).toBeDefined();

    expect(result.unwrap()).toEqual(promoCode);
  });
});
