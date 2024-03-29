import { Global, Module } from '@nestjs/common';
import { AccessControlService } from './access_control.service';

@Global()
@Module({
    providers: [AccessControlService],
    exports: [AccessControlService],
})
export class AccessControlModule {}
