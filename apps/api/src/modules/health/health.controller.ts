import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({ description: 'Process liveness status.' })
  liveness() {
    return this.healthService.liveness();
  }

  @Get('ready')
  @ApiOkResponse({ description: 'Dependency readiness status.' })
  readiness() {
    return this.healthService.readiness();
  }
}
