import {
  CreatePromoCodeCommand,
  CreatePromoCodeHandler,
} from './create-promo-code.command';
import { FakeDBService } from '../../infrastructure/fake-db/fake-db.service';
import { Weather } from '../..//domain/entities/rules/weather-rule';

const { FakeDBService: MockFakeDBService } = jest.genMockFromModule<{
  FakeDBService;
}>('../../infrastructure/fake-db/fake-db.service');

describe('[UT] CreatePromoCodeCommand', () => {
  const fakeDBService: jest.Mocked<FakeDBService> = new MockFakeDBService();
  const handler: CreatePromoCodeHandler = new CreatePromoCodeHandler(
    fakeDBService,
  );

  afterEach(() => jest.resetAllMocks());

  it('should allow to create a promocode with an age restriction and call fakeDBService to insert it', async () => {
    const command = new CreatePromoCodeCommand(
      'test',
      { percent: 50 },
      {
        eq: 40,
      },
    );

    jest.spyOn(fakeDBService, 'findPromoCode').mockReturnValue(undefined);
    jest.spyOn(fakeDBService, 'addPromoCode').mockReturnValue({} as any);

    await handler.execute(command);

    const promoCode = {
      name: 'test',
      advantage: { percent: 50 },
      restrictions: [{ age: { eq: 40 } }],
    };

    expect(fakeDBService.findPromoCode).toHaveBeenCalledWith('test');
    expect(fakeDBService.addPromoCode).toHaveBeenCalledWith(promoCode);
  });

  it('should not allow to create a promocode if a promocode with the same name already exists', async () => {
    const command = new CreatePromoCodeCommand(
      'test',
      { percent: 50 },
      {
        eq: 40,
      },
    );

    jest.spyOn(fakeDBService, 'findPromoCode').mockReturnValue({} as any);
    jest.spyOn(fakeDBService, 'addPromoCode').mockReturnValue({} as any);

    await handler.execute(command);

    expect(fakeDBService.findPromoCode).toHaveBeenCalledWith('test');

    expect(fakeDBService.addPromoCode).not.toHaveBeenCalled();
  });

  it('should allow to create a promocode with an date restriction and call fakeDBService to insert it', async () => {
    const command = new CreatePromoCodeCommand(
      'test',
      { percent: 50 },
      undefined,
      {
        before: '2022-12-12',
        after: '2022-09-12',
      },
    );

    jest.spyOn(fakeDBService, 'findPromoCode').mockReturnValue(undefined);
    jest.spyOn(fakeDBService, 'addPromoCode').mockReturnValue({} as any);

    await handler.execute(command);

    const promoCode = {
      name: 'test',
      advantage: { percent: 50 },
      restrictions: [{ date: { before: '2022-12-12', after: '2022-09-12' } }],
    };

    expect(fakeDBService.addPromoCode).toHaveBeenCalledWith(promoCode);
  });

  it('should allow to create a promocode with an weather restriction and call fakeDBService to insert it', async () => {
    const command = new CreatePromoCodeCommand(
      'test',
      { percent: 50 },
      undefined,
      undefined,
      { is: Weather.CLEAR, temp: { eq: 50 } },
    );

    jest.spyOn(fakeDBService, 'findPromoCode').mockReturnValue(undefined);
    jest.spyOn(fakeDBService, 'addPromoCode').mockReturnValue({} as any);

    await handler.execute(command);

    const promoCode = {
      name: 'test',
      advantage: { percent: 50 },
      restrictions: [{ weather: { is: Weather.CLEAR, temp: { eq: 50 } } }],
    };

    expect(fakeDBService.addPromoCode).toHaveBeenCalledWith(promoCode);
  });

  it('should allow to create a promocode with an or restriction and call fakeDBService to insert it', async () => {
    const command = new CreatePromoCodeCommand(
      'test',
      { percent: 50 },
      undefined,
      undefined,
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

    jest.spyOn(fakeDBService, 'findPromoCode').mockReturnValue(undefined);
    jest.spyOn(fakeDBService, 'addPromoCode').mockReturnValue({} as any);

    await handler.execute(command);

    const promoCode = {
      name: 'test',
      advantage: { percent: 50 },
      restrictions: [
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

    expect(fakeDBService.addPromoCode).toHaveBeenCalledWith(promoCode);
  });

  it('should allow to create a promocode with and weather restriction and call fakeDBService to insert it', async () => {
    const command = new CreatePromoCodeCommand(
      'test',
      { percent: 50 },
      undefined,
      undefined,
      undefined,
      [
        {
          age: { eq: 40 },
        },
        {
          or: [
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

    jest.spyOn(fakeDBService, 'findPromoCode').mockReturnValue(undefined);
    jest.spyOn(fakeDBService, 'addPromoCode').mockReturnValue({} as any);

    await handler.execute(command);

    const promoCode = {
      name: 'test',
      advantage: { percent: 50 },
      restrictions: [
        {
          and: [
            { age: { eq: 40 } },
            {
              or: [
                { age: { gt: 15, lt: 30 } },
                { weather: { is: 'Clear', temp: { gt: 15 } } },
              ],
            },
          ],
        },
      ],
    };

    expect(fakeDBService.addPromoCode).toHaveBeenCalledWith(promoCode);
  });
});
