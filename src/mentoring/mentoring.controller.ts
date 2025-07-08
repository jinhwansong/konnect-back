import { JwtAuthGuard } from '@/auth/jwt.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { PaginationDto } from '@/common/dto/page.dto';
import { UserRole } from '@/common/enum/status.enum';
import { RolesGuard } from '@/common/guard/roles.guard';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNullInterceptor';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateMentoringSessionDto, MentoringSessionResponseDto } from './dto/mentoring.session.dto';
import { UpdateMentoringSessionDto, UpdateSessionPublicDto } from './dto/update.mentoring.session.dto';
import { MentoringService } from './mentoring.service';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('Mentoring')
@ApiBearerAuth('access-token')
@Controller('mentoring')
@Roles(UserRole.MENTOR)
@UseGuards(JwtAuthGuard, RolesGuard)
export class MentoringController {
    constructor(private readonly mentoringService: MentoringService) {}
    
    @ApiOperation({ summary: '멘토링 세션 등록' })
    @ApiResponse({ status: 201, type: MentoringSessionResponseDto, description:'멘토링 세션이 등록되었습니다.' })
    @ApiResponse({
        status: 403,
        description: '승인된 멘토만 세션을 등록할 수 있습니다.',
    })
    @ApiResponse({
        status: 404,
        description: '멘토를 찾을 수 없습니다.',
    })
    @ApiResponse({
        status: 500,
        description: '멘토링 세션 등록 중 오류가 발생했습니다.',
    })
    @Post('')
    async createSession(
        @User('id') userId: string,
        @Body() body: CreateMentoringSessionDto,
    ) {
        return this.mentoringService.createSession(userId, body);
    }
    @ApiOperation({ summary: '멘토가 등록한 세션 목록 조회' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiResponse({
        status: 200,
        description: '등록된 세션 목록',
        type: MentoringSessionResponseDto,
        isArray: true,
    })
    @ApiResponse({
        status: 500,
        description: '등록된 세션 목록을 찾을 수 없습니다.',
    })
    @Get('')
    async getSession(
        @User('id') userId: string,
        @Query() dto: PaginationDto,
    ) {
        return this.mentoringService.getSession(userId, dto);
    }
    @ApiOperation({ summary: '멘토가 등록한 세션 상세 조회' })
    @ApiResponse({ status: 200, type: MentoringSessionResponseDto })
    @ApiResponse({ status: 404, description: '세션을 찾을 수 없습니다.' })
    @Get(':id')
    async getSessionDetail(
        @Param('id') sessionId: string,
        @User('id') userId: string,
    ) {
        return this.mentoringService.getSessionDetail(userId, sessionId);
    }
    @ApiOperation({ summary: '멘토링 세션 수정' })
    @Patch(':id')
    async updateSession(
        @Param('id') sessionId: string,
        @User('id') userId: string,
        @Body() body: UpdateMentoringSessionDto,
    ) {
        return this.mentoringService.updateSession(userId, sessionId, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: '멘토링 세션 삭제' })
    async deleteSession(
    @Param('id') sessionId: string,
    @User('id') userId: string,
    ) {
        return this.mentoringService.deleteSession(userId, sessionId);
    }

    @ApiOperation({ summary: '멘토링 세션별 공개 여부' })
    @Patch(':id/public')
    async updatePublic(
        @Param('id') sessionId: string,
        @Body() body: UpdateSessionPublicDto,
        @User('id') userId: string,
    ) {
    return this.mentoringService.updateSessionPublic(userId, sessionId, body);
    }
}
