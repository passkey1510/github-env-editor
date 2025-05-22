import { Module } from '@nestjs/common';
import { VariableController } from './variable.controller';
import { VariableService } from './variable.service';
import { GithubService } from '../github.service';

@Module({
  controllers: [VariableController],
  providers: [VariableService, GithubService],
  exports: [VariableService]
})
export class VariableModule {}
