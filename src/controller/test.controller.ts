import {
    Controller,
    Get,
    Param,
} from '@nestjs/common';
import { TestService } from 'src/service/info/test.service';

@Controller('test')
export class TestController {
    constructor(private testService: TestService) { }

    @Get('fixAll')
    async fixAll(): Promise<string> {
        console.log('fixAll');

        return this.testService.fix();
    }

    @Get('updateIsUsed')
    async updateIsUsed(): Promise<string> {
        console.log('updateIsUsed');

        return this.testService.updateIsUsed();
    }

    @Get('killDuplicated')
    async killDuplicated(): Promise<string> {
        console.log('killDuplicated');

        return this.testService.killDuplicated();
    }

    @Get('test')
    async test(): Promise<any> {
        console.log('test');

        return this.testService.test('12121');
    }
}