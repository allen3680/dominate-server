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

    async login(args: { email: string, pass: string }): Promise<void> {
        const { email, pass } = args;

        await Account.save(new Account({
            accountId: uuid(),
            email,
            pass,
            createdTime: new Date(),
            updatedTime: new Date()
        }));
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
