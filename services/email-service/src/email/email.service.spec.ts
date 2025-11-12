import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { SendGridProvider } from './providers/sendgrid.provider';
import { SMTPProvider } from './providers/smtp.provider';
import { TemplateService } from '../template/template.service';
import { NotificationType, QueueMessage, UserData } from '../types';
import { StatusReporterService } from '../common/services/status-reporter.service';

describe('EmailService', () => {
  let service: EmailService;
  let templateService: TemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string): any => {
              const config = {
                'email.provider': 'sendgrid',
                'email.maxRetries': 3,
                'email.retryDelay': 100,
                'email.circuitBreaker': {
                  timeout: 3000,
                  errorThresholdPercentage: 50,
                  resetTimeout: 30000,
                },
              };
              return config[key];
            }),
          },
        },
        {
          provide: SendGridProvider,
          useValue: {
            sendEmail: jest.fn(),
            verifyConnection: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: SMTPProvider,
          useValue: {
            sendEmail: jest.fn(),
            verifyConnection: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: TemplateService,
          useValue: {
            getTemplate: jest.fn().mockResolvedValue({
              subject: 'Test {{name}}',
              body: 'Hello {{name}}',
            }),
            substituteVariables: jest.fn((template: string, vars: UserData) => {
              return template.replace('{{name}}', vars.name);
            }),
          },
        },
        {
          provide: StatusReporterService,
          useValue: {
            reportPending: jest.fn(),
            reportDelivered: jest.fn(),
            reportFailed: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(EmailService);
    templateService = module.get(TemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process email notification successfully', async () => {
    const message: QueueMessage = {
      notification_id: 'notif-123',
      request_id: 'req-123',
      template_code: 'welcome',
      notification_type: NotificationType.EMAIL,
      user_id: 'user-123',
      user_email: 'test@example.com',
      language: 'en',
      variables: { name: 'John', link: 'https://example.com' },
      priority: 1,
      created_at: new Date().toISOString(),
      retry_count: 0,
    };

    await expect(
      service.processEmailNotification(message),
    ).resolves.not.toThrow();
  });
});
