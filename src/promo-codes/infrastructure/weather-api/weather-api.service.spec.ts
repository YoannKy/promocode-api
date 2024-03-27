import { WeatherApiService } from './weather-api.service';
import * as Axios from 'axios';

describe('[UT] WeatherApiService', () => {
  let previousOpenWeatherApiKey: string;
 
  beforeAll(() => {
    previousOpenWeatherApiKey = process.env.OPENWEATHERMAP_API_KEY;
    process.env.OPENWEATHERMAP_API_KEY = 'api_key';
  });

  afterAll(() => {
    process.env.OPENWEATHERMAP_API_KEY = previousOpenWeatherApiKey;
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('getCurrentWeather', () => {
    it('should make two axios calls to openweathermap api', async () => {
      jest
        .spyOn(Axios, 'default')
        .mockResolvedValueOnce({
          data: [
            {
              lat: 1,
              lon: 1,
            },
          ],
        })
        .mockResolvedValueOnce({
          data: {
            weather: [
              {
                main: 'Rain',
              },
            ],
            main: {
              temp: 20,
            },
          },
        });

      const weatherMapAPI = new WeatherApiService();

      const result = await weatherMapAPI.getCurrentWeather('lyon');

      expect(result).toEqual({
        weather: 'Rain',
        temp: 20,
      });
      expect(Axios.default).toHaveBeenNthCalledWith(1, {
        method: 'get',
        url: `http://api.openweathermap.org/geo/1.0/direct?appid=api_key&q=lyon`,
      });
      expect(Axios.default).toHaveBeenNthCalledWith(2, {
        method: 'get',
        url: `https://api.openweathermap.org/data/2.5/weather?appid=api_key&lat=1&lon=1&units=metric`,
      });
    });
  });
});
