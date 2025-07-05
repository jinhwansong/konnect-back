import { MentoringSchedule, Mentors } from '@/entities';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMentoringScheduleDto } from './dto/schedule.dto';
import { UpdateMentoringScheduleDto } from './dto/update.schedule.dto';

@Injectable()
export class ScheduleService {
    constructor(
        @InjectRepository(MentoringSchedule)
        private readonly scheduleRepository: Repository<MentoringSchedule>,
        @InjectRepository(Mentors)
        private readonly mentorRepository: Repository<Mentors>,
    ){}

    async createSchedule(userId:string, body:CreateMentoringScheduleDto){
        const mentor = await this.mentorRepository.findOne({
            where: { user: {id:userId}}
        })
        if (!mentor) throw new ForbiddenException('본인의 스케줄만 등록할 수 있습니다.');
        const schedule = this.scheduleRepository.create({ ...body, mentor });
        await this.scheduleRepository.save(schedule);

      return { message: '스케줄이 등록되었습니다.' };
    }

    async updateSchedule(userId:string,scheduleId: string, body:UpdateMentoringScheduleDto){
        const schedule = await this.scheduleRepository.findOne({
            where: { id: scheduleId },
            relations: { mentor: { user: true } },
        });

        if (!schedule) throw new NotFoundException('스케줄을 찾을 수 없습니다.');
        if (schedule.mentor.user.id !== userId) {
            throw new ForbiddenException('본인의 스케줄만 수정할 수 있습니다.');
        }

        Object.assign(schedule, body);
        await this.scheduleRepository.save(schedule);

        return { message: '스케줄이 수정되었습니다.' };
    }

    async deleteSchedule(userId:string, scheduleId:string){
        const schedule = await this.scheduleRepository.findOne({
            where: { id: scheduleId },
            relations: { mentor: { user: true } },
        });

        if (!schedule) throw new NotFoundException('스케줄을 찾을 수 없습니다.');
        if (schedule.mentor.user.id !== userId) {
            throw new ForbiddenException('본인의 스케줄만 삭제할 수 있습니다.');
        }

        await this.scheduleRepository.remove(schedule);
        return { message: '스케줄이 삭제되었습니다.' };
    }

    async getScheduleList(userId: string) {
        const mentor = await this.mentorRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!mentor) {
            throw new NotFoundException('멘토 정보를 찾을 수 없습니다.');
        }

        const schedules = await this.scheduleRepository.find({
            where: { mentor: { id: mentor.id } },
            order: { dayOfWeek: 'ASC', startTime: 'ASC' },
        });
        return {
            message: '멘토링 스케줄 목록을 불러왔습니다.',
            data: schedules,
        };
    }
}
