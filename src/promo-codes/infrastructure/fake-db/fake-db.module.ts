import { Global, Module } from '@nestjs/common';
import { FakeDBService } from './fake-db.service';

@Global()
@Module({
  providers: [FakeDBService],
  exports: [FakeDBService],
})
export class FakeDBModule {}
