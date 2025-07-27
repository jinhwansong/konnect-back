import { PaginationDto } from '@/common/dto/page.dto';
import { MentoringSchedule, MentoringSession, Mentors } from '@/entities';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMentoringSessionDto } from './dto/mentoring.session.dto';
import {
  UpdateMentoringSessionDto,
  UpdateSessionPublicDto,
} from './dto/update.mentoring.session.dto';

@Injectable()
export class MentoringService {
  constructor(
    @InjectRepository(Mentors)
    private readonly mentorRepository: Repository<Mentors>,
    @InjectRepository(MentoringSession)
    private sessionRepository: Repository<MentoringSession>,
    @InjectRepository(MentoringSchedule)
    private scheduleRepository: Repository<MentoringSchedule>,
  ) {}
  async createSession(userId: string, body: CreateMentoringSessionDto) {
    try {
      const mentor = await this.mentorRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });
      if (!mentor) throw new NotFoundException('멘토를 찾을 수 없습니다.');
      const hasSchedule = await this.scheduleRepository.findOne({
        where: { mentor: { id: mentor.id } },
      });
      if (!hasSchedule) {
        throw new ForbiddenException(
          '정기 스케줄을 먼저 등록해야 세션을 생성할 수 있습니다.',
        );
      }
      const session = this.sessionRepository.create({
        ...body,
        mentor,
      });

      const saved = await this.sessionRepository.save(session);
      return {
        message: '멘토링 세션이 등록되었습니다.',
        title: saved.title,
        description: saved.description,
        price: saved.price,
        duration: saved.duration,
        createdAt: saved.createdAt,
        category: saved.category,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        '멘토링 세션 등록 중 오류가 발생했습니다.',
      );
    }
  }

  async getSession(userId: string, { page = 1, limit = 10 }: PaginationDto) {
    try {
      const mentor = await this.mentorRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!mentor) {
        throw new NotFoundException('멘토 정보를 찾을 수 없습니다.');
      }

      const [session, total] = await this.sessionRepository.findAndCount({
        where: { mentor: { id: mentor.id } },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const data = session.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        duration: item.duration,
        rating: item.averageRating,
        public: item.isPublic,
        createdAt: item.createdAt,
      }));
      return {
        data,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        '등록된 세션 목록을 찾을 수 없습니다.',
      );
    }
  }

  async getSessionDetail(userId: string, sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: { mentor: { user: true } },
    });
    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다.');
    }

    if (session.mentor.user.id !== userId) {
      throw new ForbiddenException('해당 세션에 접근할 수 없습니다.');
    }
    return {
      id: session.id,
      title: session.title,
      description: session.description,
      price: session.price,
      duration: session.duration,
      category: session.category,
      rating: session.averageRating,
      public: session.isPublic,
      createdAt: session.createdAt,
    };
  }

  async updateSession(
    userId: string,
    sessionId: string,
    body: UpdateMentoringSessionDto,
  ) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: { mentor: { user: true } },
    });
    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다.');
    }

    if (session.mentor.user.id !== userId) {
      throw new ForbiddenException('본인의 세션만 수정할 수 있습니다.');
    }

    Object.assign(session, body);
    await this.sessionRepository.save(session);
    return { message: '세션이 성공적으로 수정되었습니다.' };
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: { mentor: { user: true } },
    });
    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다.');
    }

    if (session.mentor.user.id !== userId) {
      throw new ForbiddenException('본인의 세션만 삭제할 수 있습니다.');
    }

    await this.sessionRepository.remove(session);

    return { message: '세션이 성공적으로 삭제되었습니다.' };
  }

  async updateSessionPublic(
    userId: string,
    sessionId: string,
    body: UpdateSessionPublicDto,
  ) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['mentor', 'mentor.user'],
    });
    if (!session) throw new NotFoundException('세션을 찾을 수 없습니다.');
    if (session.mentor.user.id !== userId)
      throw new ForbiddenException('본인의 세션만 수정할 수 있습니다.');
    session.isPublic = body.isPublic;
    await this.sessionRepository.save(session);
    return {
      message: `세션이 ${body.isPublic ? '공개' : '비공개'}로 변경되었습니다.`,
    };
  }

  async uploadEditorImages(files: { images?: Express.Multer.File[] }) {
    const uploaded = files.images;
    if (!uploaded || uploaded.length === 0) {
      throw new BadRequestException('이미지 파일이 없습니다.');
    }

    const urls = uploaded.map(
      (file) => `${process.env.SERVER_HOST}/uploads/session/${file.filename}`,
    );
    return { urls };
  }
}
