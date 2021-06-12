import { Injectable } from '@nestjs/common';
import { from } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';
import { Cookie, CookieHistory } from 'src/entity';
import { CookieStatus } from 'src/models';
import { In, IsNull } from 'typeorm';
import { DatabaseService } from '..';
import { CommonService } from '../common.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TestService {
    constructor(
        private commonService: CommonService,
        private databaseService: DatabaseService) { }

    async fix(): Promise<string> {
        const cookies = await this.databaseService.fetchData({
            type: Cookie,
            filter: query => {
                return query
                    .where({ cuser: IsNull(), status: CookieStatus.Valid, isUsed: false })
                    .orderBy('Cookie.updatedTime', 'DESC');
            }
        });

        console.log('fix amount:', cookies.length);

        const newCookies = await from(cookies).pipe(
            concatMap(async (cookie, index) => {
                const { folderName } = cookie;

                console.log('fix:', index);
                const { cuser, cookieJson } = await this.commonService.decodeCookie('.facebook.com', folderName);
                console.log('fix:', index);

                if (!cuser) {
                    cookie.status = CookieStatus.Invalid;
                    return cookie;
                }

                cookie.cuser = cuser;
                cookie.cookieJson = JSON.tryStringify(cookieJson);

                return cookie;
            }),
            toArray())
            .toPromise();

        console.log('newCookies:', newCookies.length);

        await Cookie.save(newCookies, { chunk: 10 });

        return 'success'
    }

    async updateIsUsed(): Promise<string> {
        const list = ["100005053969216",
            "100063937659300",
            "100064320769806",
            "100044096705897",
            "100005225478806",
            "100043025580037",
            "100027992344990",
            "100003758051492",
            "100008723834012",
            "100023020680184",
            "100066234654026",
            "100023461491674",
            "100006687194239",
            "100009303509194",
            "100009708615913",
            "100035204685423",
            "100028527548173",
            "100015355481878",
            "100004161908217",
            "100009619084463",
            "100008038056717",
            "100064428016829",
            "100037842973890",
            "100039739550847",
            "100007030894844",
            "1736505467",
            "100002618797962",
            "100009937875022",
            "100009973623885",
            "100009645935970",
            "100004306184326",
            "100032807864417",
            "100002712105644",
            "100011680742068",
            "100000884060158",
            "676733771",
            "100013310701575",
            "100007154981952",
            "100003746802000",
            "100008234941206",
            "100007990997528",
            "100009721658295",
            "100011349828366",
            "100015165606517",
            "100014056037603",
            "100034327538912",
            "100022361495047",
            "100035076643135",
            "100064232766655",
            "100008278696810",
            "100007389106165",
            "100004012818388",
            "100061330606330",
            "100010902937941",
            "100056725485105",
            "100010420421553",
            "100044478273785",
            "100053054797615",
            "100008821381145",
            "100051945191843",
            "100033746202991",
            "100002550822356",
            "100005698484686",
            "100016630637612",
            "100002433366745",
            "100019070660050",
            "100001941451950",
            "100000825913689",
            "100008898309272",
            "100025908450988",
            "100009266246178",
            "100007805479459",
            "100002069596627",
            "100004060835053",
            "100007376340678",
            "1629700910",
            "100009040375857",
            "100065510304793",
            "100055771657866",
            "100025182313825",
            "100022401922746",
            "1619580666",
            "100003077146979",
            "100046814700987",
            "100004426753947",
            "100003618308606",
            "100055966119516",
            "100052141114591",
            "100010261173877",
            "100003196111922",
            "100013845557334",
            "100048142713501",
            "100012985174818",
            "100007484280429",
            "100015973548681",
            "100011582315416",
            "100000205512555",
            "100025097615082",
            "100009273531694",
            "100027564591202",
            "100056196441302",
            "100068856353876",
            "100034548980921",
            "100010560244533",
            "100064346499188",
            "100023046368229",
            "100014337155154",
            "100008954166667",
            "100001108464452",
            "100006332767098",
            "100002045140656",
            "100035432150628",
            "100009745381745",
            "100008748603082",
            "100011780349368",
            "100024885772992",
            "100009049406378",
            "100002658321030",
            "100024540756220",
            "100006818922556",
            "100064808783883",
            "100008090253186",
            "100067897005216",
            "100068697086826",
            "100006217576567",
            "100030753803421",
            "100053547673222",
            "100052576831736",
            "100005956428286",
            "100034954475702",
            "100031966788145",
            "100048160954811",
            "100002248797010",
            "100021356535899",
            "100006785675574",
            "100009324155537",
            "100045980536294",
            "1508529776",
            "100000159035437",
            "100027725663270",
            "100006453352635",
            "100066998314754",
            "100037346121860",
            "100009070159265",
            "100014516866679",
            "100054394577257",
            "100001939601321",
            "100069248015645",
            "100065018212590",
            "100009958052932",
            "100001745464810",
            "100037009362349",
            "100010360543590",
            "100022361495047",
            "100036209934365",
            "100006139428813",
            "100011349828366",
            "100064232766655",
            "100004060835053",
            "100061330606330",
            "100031966788145",
            "100009103545140",
            "100028527548173",
            "100065018212590",
            "100003758051492",
            "100043025580037",
            "100008898309272",
            "100009721658295",
            "100023046368229",
            "100034548980921",
            "100009070159265",
            "100012916536910",
            "1736505467",
            "100003196111922",
            "100051449561573",
            "100009958052932",
            "100004012818388",
            "1205841302",
            "100051966151888",
            "100000933681601",
            "100002069596627",
            "100002045140656",
            "100009303509194",
            "100023020680184",
            "100005718584190",
            "100006785675574",
            "100037842973890",
            "100001957176338",
            "100008145782442",
            "100004134091842",
            "100008038056717",
            "100064808783883",
            "100030365993746",
            "100049692461146",
            "100002606813514",
            "100024769339835",
        ];

        const cookies = await this.databaseService.fetchData({
            type: Cookie,
            filter: query => query.where({ cuser: In(list) })
        });

        console.log('cookies:', cookies.length);

        cookies.map(cookie => {
            cookie.isUsed = true;
        });

        await Cookie.save(cookies, { chunk: 10 });

        return 'success';
    }

    async killDuplicated(): Promise<string> {
        const cookies = await this.databaseService.fetchData({
            type: Cookie,
            filter: query => query.where({ mode: 1 }).orderBy('Cookie.updatedTime', 'DESC')
        });

        const goodCuser: string[] = [];
        const bad: Cookie[] = [];

        cookies.forEach(cookie => {
            const { cuser } = cookie;
            if (goodCuser.includes(cuser)) {
                bad.push(cookie);
            } else {
                goodCuser.push(cuser);
            }
        });

        console.log('goodCuser:', goodCuser.length, 'bad:', bad.length);

        await Cookie.remove(bad);

        return 'success';
    }

    async test(cuser: string) {
        const cookie = await this.databaseService.getData({
            type: Cookie,
            filter: query =>
                query.where({ cuser })
        });

        let firstTime = true;

        if (cookie) {
            console.log('Cookie已存在');

            firstTime = false;
        }

        await this.saveCookieHistory({ cuser, firstTime });

        return cookie;
    }

    async saveCookieHistory(
        args: { cuser?: string, firstTime?: boolean }
    ): Promise<any> {
        const { cuser, firstTime } = args;
        try {
            await new CookieHistory({
                cookieHistoryId: uuid(),
                cuser,
                firstTime,
            }).save();
            return;
        } catch (error) {
            console.log(' 寫入CookieHistory 失敗:', error);
            return;
        }
    }
}
