import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
} from '@nestjs/terminus';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { EmailService } from '../email/email.service';
import { ResponseHelper } from '../common/utils/response.helper';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private rabbitMQService: RabbitMQService,
    private emailService: EmailService,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Check RabbitMQ connection
      () => {
        const isConnected = this.rabbitMQService.isConnected();
        return {
          rabbitmq: {
            status: isConnected ? 'up' : 'down',
          },
        };
      },

      // Check Email provider
      async () => {
        const isHealthy = await this.emailService.checkHealth();
        return {
          email_provider: {
            status: isHealthy ? 'up' : 'down',
          },
        };
      },

      // Check Circuit Breaker
      () => {
        const isOpen = this.emailService.isCircuitOpen();
        return {
          circuit_breaker: {
            // HealthIndicatorStatus expects 'up' | 'down'
            status: isOpen ? 'down' : 'up',
            healthy: !isOpen,
            state: isOpen ? 'open' : 'closed',
          },
        };
      },
    ]);
  }

  @Get('simple')
  simpleCheck() {
    return ResponseHelper.success({
      status: 'ok',
      service: 'email-service',
      timestamp: new Date().toISOString(),
    });
  }
}
