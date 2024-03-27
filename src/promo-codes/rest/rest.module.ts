import { Module } from '@nestjs/common';
import { PromoCodeController } from './promo-code.controller';
import { CommandModule } from '../commands/command.module';
import { QueryModule } from '../queries/query.module';

@Module({
  imports: [CommandModule, QueryModule],
  controllers: [PromoCodeController],
})
export class RestModule {}
