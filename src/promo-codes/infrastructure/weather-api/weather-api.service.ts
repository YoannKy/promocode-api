import { Injectable } from '@nestjs/common';
import axios from 'axios';

/**
 * Handles call to openweathermap API
 */
@Injectable()
export class WeatherApiService {
  /**
   * Get the current weather based on the town provided
   * @param town The requested  town
   */
  public async getCurrentWeather(town: string): Promise<{
    weather: string;
    temp: number;
  }> {
    const { lat, lon } = await this.getTownCoordinates(town);
    const result = await axios({
      method: 'get',
      url: `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OPENWEATHERMAP_API_KEY}&lat=${lat}&lon=${lon}&units=metric`,
    });

    return {
      weather: result.data.weather[0].main,
      temp: result.data.main.temp,
    };
  }
  /**
   * Base on a town, find its coordinates (ie latitude, longitude)
   * @param town the requested town
   */
  protected async getTownCoordinates(
    town: string,
  ): Promise<{ lon: number; lat: number }> {
    const result = await axios({
      method: 'get',
      url: `http://api.openweathermap.org/geo/1.0/direct?appid=${process.env.OPENWEATHERMAP_API_KEY}&q=${town}`,
    });
    return {
      lat: result.data[0].lat,
      lon: result.data[0].lon,
    };
  }
}
