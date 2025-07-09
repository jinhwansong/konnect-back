import { JwtAuthGuard } from '@/auth/jwt.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { UserRole } from '@/common/enum/status.enum';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNull.Interceptor';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateMentoringScheduleDto } from './dto/schedule.dto';
import { UpdateMentoringScheduleDto } from './dto/update.schedule.dto';
import { ScheduleService } from './schedule.service';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('Schedule')
@ApiBearerAuth('access-token')
@Controller('schedule')
@Roles(UserRole.MENTOR)
@UseGuards(JwtAuthGuard)
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService){}

    @Post('schedule')
    @ApiOperation({ summary: '스케줄 등록' })
    @ApiResponse({ status: 201, description: '스케줄이 등록되었습니다.', type:CreateMentoringScheduleDto })
    async createSchedule(
        @User('id') userId: string,
        @Body() body: CreateMentoringScheduleDto,
    ) {
        return this.scheduleService.createSchedule(userId, body);
    }

    @Patch('schedule/:id')
    @ApiOperation({ summary: '스케줄 수정' })
    @ApiResponse({ status: 200, description: '스케줄이 수정되었습니다.' })
    @ApiResponse({ status: 403, description: '본인의 스케줄만 수정 가능' })
    @ApiResponse({ status: 404, description: '스케줄을 찾을 수 없습니다.' })
    async updateSchedule(
        @User('id') userId: string,
        @Param('id') scheduleId: string,
        @Body() body: UpdateMentoringScheduleDto,
    ) {
        return this.scheduleService.updateSchedule(userId,scheduleId, body);
    }

    @Delete('schedule/:id')
    @ApiOperation({ summary: '스케줄 삭제' })
    @ApiResponse({ status: 200, description: '스케줄이 삭제되었습니다.' })
    @ApiResponse({ status: 403, description: '본인의 스케줄만 삭제 가능' })
    @ApiResponse({ status: 404, description: '스케줄을 찾을 수 없습니다.' })
    async deleteSchedule(
        @Param('id') scheduleId: string,
        @User('id') userId: string,
    ) {
        return this.scheduleService.deleteSchedule(userId, scheduleId);
    }

    @Get('schedule')
    @ApiOperation({ summary: '멘토링 스케줄 목록 조회' })
    @ApiResponse({ status: 200, description: '등록된 스케줄 목록 반환' })
    @ApiResponse({ status: 404, description: '멘토 정보를 찾을 수 없습니다.' })
    async getMyScheduleList(@User('id') userId: string) {
        return this.scheduleService.getScheduleList(userId);
    }
}
