import { Module } from '@nestjs/common';
import { RepositoryModule } from './repository/repository.module';
import { EnvironmentModule } from './environment/environment.module';
import { VariableModule } from './variable/variable.module';
import { GithubService } from './github.service';

@Module({
  imports: [RepositoryModule, EnvironmentModule, VariableModule],
  providers: [GithubService],
  exports: [GithubService, RepositoryModule, EnvironmentModule, VariableModule]
})
export class GithubModule {}
