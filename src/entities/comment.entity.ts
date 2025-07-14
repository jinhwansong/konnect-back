// import { ApiProperty } from '@nestjs/swagger';
// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   ManyToOne,
//   OneToMany,
//   PrimaryGeneratedColumn,
//   UpdateDateColumn,
// } from 'typeorm';
// import { Article } from './article.entity';
// import { Users } from './user.entity';

// @Entity({ schema: 'konnect', name: 'comment' })
// export class Comment {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ type: 'varchar', length: 255, nullable: false })
//   content: string;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;

//   @ApiProperty({ description: '댓글 작성자', required: true })
//   @ManyToOne(() => Users, (user) => user.comments, {
//     onDelete: 'CASCADE',
//   })
//   user: Users;
//   @ApiProperty({ description: '댓글 대상 (아티클)', required: false })
//   @ManyToOne(() => Article, (article) => article.comments, {
//     nullable: true,
//     onDelete: 'CASCADE',
//   })
//   article: Article;
//   @ManyToOne(() => Comment, (comment) => comment.children, {
//     nullable: true,
//     onDelete: 'CASCADE',
//   })
//   parent: Comment;

//   @OneToMany(() => Comment, (comment) => comment.parent)
//   children: Comment[];
// }
