import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ShowroomsController } from './showrooms.controller';
import { ShowroomsService } from './showrooms.service';

@Module({
  imports: [AuthModule],
  controllers: [ShowroomsController],
  providers: [ShowroomsService],
})
export class ShowroomsModule {}
