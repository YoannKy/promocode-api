import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Status } from '../src/promo-codes/queries/check-promo-code/check-promo-code.query';
import { WeatherApiService } from '../src/promo-codes/infrastructure/weather-api/weather-api.service';
import { Weather } from '../src/promo-codes/domain/entities/rules/weather-rule';

describe('PromoCode (e2e)', () => {
  let app: INestApplication;
  let weatherApiService: WeatherApiService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    weatherApiService = await app.resolve(WeatherApiService);
  });

  afterEach(() => jest.resetAllMocks());

  afterAll(async () => await app.close());

  describe('/promo-codes', () => {
    describe('GET /check', () => {
      it('should return a denied status because the promoCode name does not exist', async () => {
        await request(app.getHttpServer())
          .get('/promo-codes/check')
          .expect(200)
          .expect({
            status: Status.DENIED,
            reasons: 'No promoCode with this name was found',
          });
      });

      it('should find the requested promoCode and validate the user (age 15 and weather both match: accepted)', async () => {
        jest.spyOn(weatherApiService, 'getCurrentWeather').mockResolvedValue({
          weather: Weather.ASH,
          temp: 16,
        });

        const response = await request(app.getHttpServer())
          .get('/promo-codes/check')
          .query({
            age: 15,
            name: 'happy10',
            town: 'lyon',
          });

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
          status: Status.ACCEPTED,
          advantage: { percent: 10 },
          name: 'happy10',
        });

        expect(weatherApiService.getCurrentWeather).toHaveBeenCalledWith(
          'lyon',
        );
      });

      it('should find the requested promoCode and validate the user (age: 40 and weather match: accepted)', async () => {
        jest.spyOn(weatherApiService, 'getCurrentWeather').mockResolvedValue({
          weather: Weather.ASH,
          temp: 16,
        });

        const response = await request(app.getHttpServer())
          .get('/promo-codes/check')
          .query({
            age: 40,
            name: 'happy10',
            town: 'lyon',
          });

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
          status: Status.ACCEPTED,
          advantage: { percent: 10 },
          name: 'happy10',
        });

        expect(weatherApiService.getCurrentWeather).toHaveBeenCalledWith(
          'lyon',
        );
      });
    });

    describe('POST /promo-codes', () => {
      it('should allow the creation of a valid promoCode', async () => {
        const response = await request(app.getHttpServer())
          .post('/promo-codes')
          .send({
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
          });

        expect(response.status).toEqual(201);
        expect(response.body).toEqual({
          name: 'test',
          advantage: {
            percent: 50,
          },
          restrictions: [
            {
              date: {
                before: '2022-12-12',
                after: '2022-09-12',
              },
            },
            {
              or: [
                {
                  age: {
                    eq: 40,
                  },
                },
                {
                  and: [
                    {
                      age: {
                        gt: 15,
                        lt: 30,
                      },
                    },
                    {
                      weather: {
                        is: 'Clear',
                        temp: {
                          gt: 15,
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        });
      });

      it('notshould allow the creation of a promoCode if the latter is not valid', async () => {
        const response = await request(app.getHttpServer())
          .post('/promo-codes')
          .send({
            name: 'test',
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
          });

        expect(response.status).toEqual(400);
        expect(response.body).toEqual(
          expect.objectContaining({
            message:
              'Validation error: percent should not be null or undefined',
          }),
        );
      });

      it('notshould allow the creation of a promoCode if the latter already exist (through name)', async () => {
        const response = await request(app.getHttpServer())
          .post('/promo-codes')
          .send({
            name: 'happy10',
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
          });

        expect(response.status).toEqual(400);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Validation error: This promocode name already exist',
          }),
        );
      });
    });
  });
});
