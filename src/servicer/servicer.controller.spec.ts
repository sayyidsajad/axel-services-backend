import { Test, TestingModule } from '@nestjs/testing';
import { ServicerController } from './servicer.controller';
import { ServicerService } from './servicer.service';

describe('ServicerController', () => {
  let controller: ServicerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicerController],
      providers: [ServicerService],
    }).compile();

    controller = module.get<ServicerController>(ServicerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
