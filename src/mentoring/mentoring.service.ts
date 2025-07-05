import { PaginationDto } from '@/common/dto/page.dto';
import { UserRole } from '@/common/enum/status.enum';
import { MentoringSession, Mentors } from '@/entities';
import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMentoringSessionDto } from './dto/mentoring.session.dto';
import { UpdateMentoringSessionDto } from './dto/update.mentoring.session.dto';

@Injectable()
export class MentoringService {
  constructor(
    @InjectRepository(Mentors)
    private readonly mentorRepository: Repository<Mentors>,
    @InjectRepository(MentoringSession)
    private sessionRepository: Repository<MentoringSession>,
  ) {}
  async createSession(userId: string, body: CreateMentoringSessionDto) {
    try {
        const mentor = await this.mentorRepository.findOne({
            where: {user : {id: userId}},
            relations: ['user']
        })
        if(!mentor) throw new NotFoundException('멘토를 찾을 수 없습니다.');
        if(mentor.user.role !== UserRole.MENTOR) {
            throw new ForbiddenException(
              '승인된 멘토만 세션을 등록할 수 있습니다.',
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
            createdAt:saved.createdAt
        }
    } catch (error) {
         throw new InternalServerErrorException(
          '멘토링 세션 등록 중 오류가 발생했습니다.',
        );
    }
  }

  async getSession (userId: string, { page = 1, limit = 10 }: PaginationDto ) {
    try {
      const mentor = await this.mentorRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!mentor) {
      throw new NotFoundException('멘토 정보를 찾을 수 없습니다.');
    }

    const [session, total] = await this.sessionRepository.findAndCount({
      where: { mentor: {id: mentor.id}},
      order:{createdAt:'DESC'},
      skip:(page - 1 ) * limit,
      take: limit
    })

    const data = session.map((item) => ({
      id:item.id,
      title:item.title,
      price:item.price,
      duration:item.duration,
      createdAt:item.createdAt
    }))
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
    } catch (error) {
      throw new InternalServerErrorException(
        '등록된 세션 목록을 찾을 수 없습니다.',
      );
    }
  }

  async getSessionDetail(userId:string, sessionId:string) {
    const session = await this.sessionRepository.findOne({
      where: {id: sessionId},
      relations: {mentor: {user: true}}
    })
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
      createdAt: session.createdAt,
    };
  }
  
  async updateSession(userId:string, sessionId:string, body:UpdateMentoringSessionDto) {
    const session = await this.sessionRepository.findOne({
      where: {id: sessionId},
      relations: {mentor: {user: true}}
    })
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

  async deleteSession(userId:string, sessionId:string) {
    const session = await this.sessionRepository.findOne({
      where: {id: sessionId},
      relations: {mentor: {user: true}}
    })
    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다.');
    }

    if (session.mentor.user.id !== userId) {
      throw new ForbiddenException('본인의 세션만 삭제할 수 있습니다.');
    }

     await this.sessionRepository.remove(session);

     return { message: '세션이 성공적으로 삭제되었습니다.' };
  }
}
