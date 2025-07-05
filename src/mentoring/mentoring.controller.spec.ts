import { Test, TestingModule } from '@nestjs/testing';
import { MentoringController } from './mentoring.controller';

describe('MentoringController', () => {
  let controller: MentoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentoringController],
    }).compile();

    controller = module.get<MentoringController>(MentoringController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
