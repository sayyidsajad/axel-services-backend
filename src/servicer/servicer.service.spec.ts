import { Test, TestingModule } from '@nestjs/testing';
import { ServicerService } from './servicer.service';

describe('ServicerService', () => {
  let service: ServicerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicerService],
    }).compile();

    service = module.get<ServicerService>(ServicerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
