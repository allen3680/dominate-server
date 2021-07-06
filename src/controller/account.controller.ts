import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AccountService } from 'src/service';

@Controller('account')
export class AccountController {
    constructor(private accountService: AccountService) { }

    @Post('login')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async uploadZip(
        @Body() body: { email: string, pass: string },
        @Res() res: any
    ): Promise<void> {
        console.log('login');

        return this.accountService.login(body, res);
    }

    @Get('list')
    async fetchAccount(
        @Query() req: { startDate: Date; endDate: Date },
    ): Promise<{
        total: number,
        list: { email: string; pass: string; createdTime: string }[]
    }> {
        console.log('fetchAccounts');

        return this.accountService.fetchAccounts(req);
    }
}
