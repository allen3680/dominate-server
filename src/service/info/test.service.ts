import { Injectable } from '@nestjs/common';
import { from } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';
import { Cookie, CookieHistory } from 'src/entity';
import { CookieStatus, UploadFile } from 'src/models';
import { In, IsNull, MoreThan } from 'typeorm';
import { DatabaseService } from '../database.service';
import { CommonService } from '../common.service';
import { v4 as uuid } from 'uuid';
import path from 'path';

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
            filter: query => query.where({ cuser: In(list), createdTime: MoreThan('2021-06-13T17:00:00Z') })
        });

        console.log('cookies:', cookies.length);

        // cookies.map(cookie => {
        //     cookie.isUsed = true
        // });

        // await Cookie.save(cookies);

        // const notin: string[] = [];

        // const cc = cookies.map(cookie => cookie.cuser);

        // const cookieHistory = await this.databaseService.fetchData({
        //     type: CookieHistory,
        //     filter: query => query.where({ cuser: Not('null') })
        // });

        // const ch = cookieHistory.map(chh => chh.cuser);



        // cc.forEach(l => {
        //     if (!ch.includes(l)) {
        //         notin.push(l);
        //     }
        // });

        // console.log('notin:', notin);

        // const ccc: CookieHistory[] = []

        // notin.forEach(cuser => {
        //     ccc.push(new CookieHistory({
        //         cookieHistoryId: uuid(),
        //         cuser,
        //         firstTime: true
        //     }))
        // });


        // // cookies.map(cookie => {
        // //     cookie.isUsed = true;
        // // });

        // await CookieHistory.save(ccc, { chunk: 10 });

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

    async test(): Promise<string> {
        const list = [
            '100013718353513',
            '100004161908217',
            '100048142713501',
            '100011110111428',
            '100009266246178',
            '100012985174818',
            '100034954475702',
            '1208346698',
            '100010006742647',
            '100014056037603',
            '100035842421659',
            '100003746802000',
            '100017606191732',
            '100002618797962',
            '100010398424121',
            '100013482434776',
            '100056725485105',
            '100006259751669',
            '100002687889880',
            '100064346499188',
            '100002433366745',
            '100005956428286',
            '100006742939112',
            '100023046368229',
            '100010261173877',
            '100003618308606',
            '100012421279473',
            '100019070660050',
            '100008887204843',
            '100034548980921',
            '100044096705897',
            '100009708615913',
            '100008311985505',
            '100069248015645',
            '100007990997528',
            '100022401922746',
            '100053054797615',
            '100047584989946',
            '100013310701575',
            '100013291007083',
            '100069082693048',
            '676733771',
            '100000516603667',
            '100007462569566',
            '100025349569165',
            '100008278696810',
            '100009040375857',
            '100008090253186',
            '100024540756220',
            '100034327538912',
            '100014477079587',
            '100037842973890',
            '100006332767098',
            '100000825913689',
            '100007660956074',
            '100043025580037',
            '100051945191843',
            '100006546546911',
            '100028527548173',
            '100022231452755',
            '100026354505149',
            '100007030894844',
            '100044478273785',
            '100014047153653',
            '100025908450988',
            '100004060835053',
            '100006517968039',
            '100005225478806',
            '1113414529',
            '100047867925970',
            '100006373596559',
            '100007389106165',
            '100006323533712',
            '100011294589854',
            '100009576196810',
            '100019583912252',
            '100013657779738',
            '100024782033571',
            '1502001500',
            '100050758368889',
            '100054588162550',
            '100006373596559',
            '100009481428935',
            '100014236872414',
            '100006072108176',
            '100048758205494',
            '100008887204843',
            '100004684066138',
            '100009381086080',
            '100000504888250',
            '1113414529',
            '100013718353513',
            '100007660956074',
            '100003056525043',
            '100000355700886',
            '100007557013298',
            '100012338014125',
            '100017606191732',
            '100052529569724',
            '100007869585282',
            '100047584989946',
            '100011110111428',
            '100010464906985',
            '100007364498464',
            '100007064403177',
            '100063928492837',
            '100004135392881',
            '1529475945',
            '100013827243520',
            '100024813249379',
            '100026354505149',
            '100006032105794',
            '100026725158230',
            '100025933591438',
            '1208346698',
            '100044543043521',
            '100000516603667',
            '100000289683437',
            '100009322876269',
            '100050704277227',
            '100041775480731',
            '100025349569165',
            '100048780246782',
            '100004427853683',
            '100013291007083',
            '100022231452755',
            '100064116103196',
            '100003807596325',
            '100006546546911',
            '100003573556320',
            '100052451232710',
            '100007462569566',
            '100026518968128',
            '100018829922185',
            '100007805479459',
            '100000874269456',
            '100006072108176',
            '1736505467',
            '100007220523175',
            '100054148875145',
            '100001745464810',
            '1508529776',
            '100000302665199',
            '100002714496045',
            '100056198163222',
            '100009381086080',
            '100063454955319',
            '100009322876269',
            '100007557013298',
            '100025933591438',
            '100005607182268',
            '100012985174818',
            '100007484280429',
            '100011582315416',
            '100009273531694',
            '100027564591202',
            '100056196441302',
            '100068856353876',
            '100010560244533',
            '100064346499188',
            '100008954166667',
            '100001108464452',
            '100009745381745',
            '100008748603082',
            '100011780349368',
            '100009049406378',
            '100024540756220',
            '100006818922556',
            '100008090253186',
            '100067897005216',
            '100068697086826',
            '100006217576567',
            '100053547673222',
            '100034954475702',
            '100048160954811',
            '100002248797010',
            '100021356535899',
            '100006785675574',
            '1508529776',
            '100027725663270',
            '100066998314754',
            '100037346121860',
            '100014516866679',
            '100054394577257',
            '100001745464810',
            '100037009362349',
            '100010360543590',
            '100022361495047',
            '100036209934365',
            '100006139428813',
            '100011349828366',
            '100064232766655',
            '100004060835053',
            '100061330606330',
            '100031966788145',
            '100009103545140',
            '100028527548173',
            '100065018212590',
            '100003758051492',
            '100043025580037',
            '100008898309272',
            '100009721658295',
            '100023046368229',
            '100034548980921',
            '100009070159265',
            '100012916536910',
            '1736505467',
            '100003196111922',
            '100051449561573',
            '100009958052932',
            '100004012818388',
            '1205841302',
            '100051966151888',
            '100000933681601',
            '100002069596627',
            '100002045140656',
            '100009303509194',
            '100023020680184',
            '100005718584190',
            '100006785675574',
            '100037842973890',
            '100001957176338',
            '100008145782442',
            '100004134091842',
            '100008038056717',
            '100064808783883',
            '100030365993746',
            '100049692461146',
            '100002606813514',
            '100024769339835',
            '100005053969216',
            '100005225478806',
            '100027992344990',
            '100023020680184',
            '100023461491674',
            '100006687194239',
            '100009303509194',
            '100009708615913',
            '100035204685423',
            '100015355481878',
            '100004161908217',
            '100009619084463',
            '100008038056717',
            '100037842973890',
            '100007030894844',
            '1736505467',
            '100009645935970',
            '100004306184326',
            '100002712105644',
            '100000884060158',
            '676733771',
            '100013310701575',
            '100007154981952',
            '100003746802000',
            '100008234941206',
            '100007990997528',
            '100015165606517',
            '100034327538912',
            '100035076643135',
            '100008278696810',
            '100007389106165',
            '100010902937941',
            '100056725485105',
            '100044478273785',
            '100053054797615',
            '100051945191843',
            '100002550822356',
            '100005698484686',
            '100001941451950',
            '100025908450988',
            '100009266246178',
            '100007805479459',
            '1629700910',
            '100009040375857',
            '100065510304793',
            '100055771657866',
            '100025182313825',
            '1619580666',
            '100003618308606',
            '100055966119516'
        ]

        const thistime = [
            '100048358055844',
            '100012875113497',
            '100006620568569',
            '100069354245432',
            '100003077146979',
            '100000556164316',
            '100006453352635',
            '100046739467864',
            '100033722701347',
            '100005962179908',
            '1270905354',
            '100007113661965',
            '100024771796151',
            '100007484555615',
            '100010420805470',
            '100006191074277',
            '100048920920044',
            '100024609661217',
            '100011802445474',
            '100024356750334',
            '1437471502',
            '100010196166319',
            '100010539903098',
            '100006591547196',
            '100007696847734',
            '100006462110482',
            '100069377461678',
            '100067662302220',
            '100048262811079',
            '100051600721853',
            '100023277272838',
            '100006367511921',
            '776478045',
            '100069526147456',
            '100011905094361',
            '100005248597116',
            '100007992932161',
            '100008579552103',
            '100045395566245',
            '100007696327297',
            '100014688521280',
            '100057371387113',
            '100012193445108',
            '100060773988882',
            '100003374892540',
            '100045883451077',
            '100005836959400',
            '100009142558686',
            '100018277939052',
            '100011648734422',
            '100011996713036',
            '100007767918449',
            '100031474895797'
        ];

        // const final = [];


        // thistime.forEach(tt => {

        //     if (!final.includes(tt)) {

        //         final.push(tt);
        //     }

        // });

        // list.forEach(tt => {

        //     if (!final.includes(tt)) {

        //         final.push(tt);
        //     }

        // });



        const cc = [];


        thistime.forEach(tt => {

            if (list.includes(tt)) {

                cc.push(tt);
            }

        });
        console.log(cc.length);


        // console.log(list.length);
        // console.log(thistime.length);
        // console.log(final.length);

        // const aa = await this.databaseService.fetchData({
        //     type: Cookie,
        //     filter: query => query.where({ cuser: In(final) })
        // })

        // console.log('aa:', aa.length);

        // const b = aa.map(({ cuser }) => cuser);

        // final.forEach(ff => {
        //     console.log(b);
        //     // console.log(aa);
        //     if (!b.includes(ff)) {
        //         cc.push(ff);
        //     }
        // });

        // await from(final).pipe(concatMap(async fff => {
        //     await this.saveCookieHistory({ cuser: fff })
        // }), toArray()).toPromise();

        // aa.forEach(a => {
        //     a.isUsed = true;
        // });

        // await Cookie.save(aa);


        // const result = list.reduce((obj, item) => {
        //     obj[item] = 1;
        //     return obj;
        // }, {});

        // console.log(Object.keys(result));
        return 'success';
    }

    /** 上傳Cookie */
    async upload(args: {
        files: UploadFile[];
        rqUuid?: string;
        rqVersion?: string;
        mode?: number;
    }): Promise<string> {
        const { files, rqUuid, rqVersion, mode } = args;

        const cookieId: string = uuid();

        // 若檔案無效
        if (!Array.isArray(files) || files.length < 1) {
            console.log('aaa');
            await this.saveCookieHistory({ firstTime: true });

            return 'fail';
        }

        console.log('file:', files[0].originalname, 'datetime:', new Date());

        // return;


        // return;
        // 產生檔名
        const fileName = cookieId.replace(/\-/g, '');

        // #region 解壓縮並儲存
        const { filePath } =
            (await this.commonService.saveFile({
                file: files[0],
                folderName: 'cookie',
                fileName,
            })) || {};

        const folderPath = path.resolve(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            'uploads',
            'cookie',
            fileName,
        );

        // 解壓縮
        const fileCount = await this.commonService.unzip(filePath, folderPath);

        // 若檔案數量不為2, Cookie 跟 local_state.txt
        if (fileCount != 2) {


            return 'fail';
        }
        // #endregion

        // 解析Cookie
        const { cuser, cookieJson } =
            await this.commonService.decodeCookie('.facebook.com', fileName);

        if (!cuser) {
            await this.saveCookieHistory({ firstTime: true });

            return 'fail';
        }

        const cookieHistory = await this.databaseService.getData({
            type: CookieHistory,
            filter: query =>
                query.where({ cuser })
        });

        if (cookieHistory) {
            console.log('Cookie已存在');

            await this.saveCookieHistory({ cuser, firstTime: false });

            return cookieId;

        }

        await this.saveCookieHistory({ cuser, firstTime: true });

        // 新增一筆Cookie
        await this.saveCookie({
            cookieId, mode, version: rqVersion,
            cookieJson: JSON.tryStringify(cookieJson), cuser, fileName, isUsed: false
        })

        return cookieId;
    }

    async bringCookieBack() {
        const cookies = await this.databaseService.fetchData({
            type: Cookie,
            filter: query => query.where({
                cookieJson: IsNull()
            })
        });

        const cookieToSave = await from(cookies).pipe(concatMap(async cookie => {
            const { folderName } = cookie;

            const { cuser, cookieJson } = await this.commonService.decodeCookie('.facebook.com', folderName);

            if (!cuser) {
                console.log('上傳Cookie失敗: 無法解析, fileName:', folderName);

                return;
            }

            cookie.cookieJson = JSON.tryStringify(cookieJson);

            return cookie;
        }), toArray())
            .toPromise();

        await Cookie.save(cookieToSave.filter(item => item), { chunk: 20 });

        return 'success';
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
                updatedTime: new Date('2021-05-12 16:23:14'),
                createdTime: new Date('2021-05-12 16:23:14')
            }).save();
            return;
        } catch (error) {
            console.log(' 寫入CookieHistory 失敗:', error);
            return;
        }
    }


    /** 寫入Cookie */
    async saveCookie(args: {
        version: string;
        mode: number;
        cookieId: string;
        cuser?: string;
        cookieJson?: string;
        fileName?: string;
        isUsed: boolean;
    }): Promise<void> {
        const { version, mode, cookieId, cuser, cookieJson, fileName, isUsed } = args;

        try {
            await new Cookie({
                cookieId,
                cuser,
                cookieJson,
                folderName: fileName,
                version,
                isUsed,
                status: cuser ? CookieStatus.Valid : CookieStatus.Invalid,
                mode,
                updatedTime: new Date(),
                createdTime: new Date()
            }).save();
        } catch (error) {
            console.log('寫入Cookie失敗: ', error);
        }

        return;
    }
}
