import { Module } from '@nestjs/common';
import { EnvironmentController } from './environment.controller';
import { EnvironmentService } from './environment.service';
import { VariableModule } from '../variable/variable.module';
import { GithubService } from '../github.service';

@Module({
  imports: [VariableModule],
  controllers: [EnvironmentController],
  providers: [EnvironmentService, GithubService]
})
export class EnvironmentModule {}
