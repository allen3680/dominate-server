import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/common';
import { CronJob } from 'cron';
import { DatabaseService } from '../database.service';
import { Miner } from 'src/entity/Miner';
import * as moment from 'moment';

@Injectable()
export class MiningService {
    constructor(
        private databaseService: DatabaseService,
        private httpService: HttpService,
    ) { }

    async getMinersFromDb(args?: { date: Date }): Promise<{ total: number, miners: string[], error?: string }> {
        const { date } = args;

        const miners = await this.databaseService.fetchData({
            type: Miner,
            filter: query => {
                if (date) {
                    query.where({ joinDate: date });
                }

                return query
            }
        });

        if (miners?.length < 1) {
            return { total: 0, miners: [] };
        }

        return { total: miners.length, miners: miners.map(({ minerId }) => minerId) };
    }

    initCronJob(): void {
        new CronJob({
            cronTime: '0 */10 * * * *',
            onTick: () => this.getMiners(),
        }).start();
    }

    async getMiners(): Promise<{ total: number, workers: string[], error?: string }> {
        console.log('取得礦工排程 時間:', new Date());

        try {
            const url = `https://api.moneroocean.stream/miner/42fk7PmRMv8BdpbGaX74yvhmFzGYY9yCGXim9tgTZTuPaDntuXyPEA81rFmco6oZpqJSV5X3Es7ATUFjf3ZG8pGhDQrURVJ/chart/hashrate/allWorkers`;
            const response: AxiosResponse<{ [worker: string]: any[] }> = await this.httpService
                .get(url)
                .toPromise();

            if (!response?.data) {
                console.log('取得礦工排程失敗');
                return;
            }

            const regex = new RegExp(`AMINER\w*`);
            const miners = Object.keys(response.data).filter(item => regex.test(item));

            const minerToSave = miners.map(miner => {
                return new Miner({
                    minerId: miner,
                    joinDate: moment(miner.slice(6, 14)).toDate(),
                    createdTime: new Date(),
                    updatedTime: new Date()
                });
            });

            await Miner.save(minerToSave, { chunk: 30 });

            return;
        } catch (error) {
            console.log('取得礦工排程失敗:', error);
            return;
        }
    }
}
