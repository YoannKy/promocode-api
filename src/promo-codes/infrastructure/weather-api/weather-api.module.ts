import { Module } from '@nestjs/common';
import { WeatherApiService } from './weather-api.service';

@Module({
  imports: [],
  providers: [WeatherApiService],
  exports: [WeatherApiService],
})
export class WeatherApiModule {}
