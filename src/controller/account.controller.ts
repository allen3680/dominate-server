import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AccountService } from 'src/service';

@Controller('account')
export class AccountController {
    constructor(private accountService: AccountService) { }

    @Post('login')
    async uploadZip(
        @Body() body: { email: string, pass: string },
    ): Promise<void> {
        console.log('login');

        return this.accountService.login(body);
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
