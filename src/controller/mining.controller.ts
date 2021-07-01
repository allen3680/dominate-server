import { Controller, Get, Query } from '@nestjs/common';
import { MiningService } from 'src/service';

@Controller('mining')
export class MiningController {
    constructor(private miningService: MiningService) { }

    @Get('workers')
    async getWorkers(
        @Query() req: { date: Date },
    ): Promise<{ total: number, miners: string[] }> {
        console.log('getWorkers');

        return this.miningService.getMinersFromDb(req);
    }
}
