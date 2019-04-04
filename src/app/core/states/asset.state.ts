import {
    Injectable
} from '@angular/core';
import {
    HttpService
} from '../services/http.service';
import {
    GlobalService
} from '../services/global.service';
import {
    ChromeService
} from '../services/chrome.service';
import {
    Observable,
} from 'rxjs';
import {
    Balance,
} from 'src/models/models';
import {
    map,
    switchMap,
} from 'rxjs/operators';

@Injectable()
export class AssetState {
    public assetFile: Map < string, {} > = new Map();
    public defaultAssetSrc = '/assets/images/default_asset_logo.jpg';
    public webDelAssetId = '';

    constructor(
        private http: HttpService,
        private global: GlobalService,
        private chrome: ChromeService,
    ) {
        this.chrome.getAssetFile().subscribe(res => {
            this.assetFile = res;
        });
    }

    public clearCache() {
        this.assetFile = new Map();
    }

    public detailTemp(address: string, id: string): Observable<Balance> {
        return this.fetchBalanceTemp(address).pipe(switchMap(balance => this.chrome.getWatch().pipe(map(watching => {
            return balance.find((e) => e.asset_id === id) || watching.find(w => w.asset_id === id);
        }))));
    }

    public fetchBalanceTemp(address: string): Observable<any> {
        console.log('11111')
        return this.http.get(`${ this.global.apiDomain }/v1/address/assets?address=${ address }`);
    }

    public fetchAllTemp(page: number): Promise<any> {
        return this.http.get(`${this.global.apiDomain}/v1/asset/getallassets?page_index=${page}`).toPromise();
    }

    public searchAsset(query: string): Observable < any > {
        return this.http.get(`${this.global.apiDomain}/v1/search?query=${query}`);
    }

    public getAssetSrc(assetId: string, lastModified: string): Observable < string > {
        return this.http.getImage(`${ this.global.apiDomain }/logo/${ assetId }`, lastModified);
    }

    public setAssetFile(res: any, assetId: string): Promise < any > {
        const temp = {};
        temp['last-modified'] = res.getResponseHeader('Last-Modified');
        return new Promise((resolve, reject) => {
            const a = new FileReader();
            a.readAsDataURL(res.response); // 读取文件保存在result中
            a.onload = (e: any) => {
                const getRes = e.target.result; // 读取的结果在result中
                temp['image-src'] = getRes;
                this.assetFile.set(assetId, temp);
                this.chrome.setAssetFile(this.assetFile);
                resolve(getRes);
            };
        });
    }
    public getRate(query): Observable < any > {
        const target = this.global.formatQuery(query);
        return this.http.get(`${this.global.apiDomain}/v1/asset/exchange_rate${target}`);
    }
}
