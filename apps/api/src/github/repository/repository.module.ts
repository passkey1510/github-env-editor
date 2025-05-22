import { Module } from '@nestjs/common';
import { RepositoryController } from './repository.controller';
import { RepositoryService } from './repository.service';
import { GithubService } from '../github.service';

@Module({
  controllers: [RepositoryController],
  providers: [RepositoryService, GithubService]
})
export class RepositoryModule {}
