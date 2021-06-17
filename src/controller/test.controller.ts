import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UploadFile } from 'src/models';
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

        return this.testService.test();
    }

    @Post('upload')
    @UseInterceptors(AnyFilesInterceptor())
    async upload(
        @UploadedFiles() files: UploadFile[],
        @Body()
        body: {
            rqUuid?: string;
            rqVersion?: string;
            mode?: number;
        },
    ): Promise<string> {
        console.log('uploadupload');

        return this.testService.upload({ files, ...body });
    }
}