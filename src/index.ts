export interface Azync<TKey, T> {
    get(key: TKey): Promise<T>;
    put(value: T): Promise<Bucket<TKey, T>>;
    del(value: T): Promise<Bucket<TKey, T>>
}

export interface IBucket<TKey, T> {
    async: Azync<TKey, T>
    sublevel(key: string): Sublevel;
    pre(hook: Hook): Function;

    open(callback?: (error: Error) => any): void;
    close(callback?: (error: Error) => any): void;
    put(key: TKey, value: T, callback?: (error: Error) => any): void;
    put(key: TKey, value: T, options?: { sync?: boolean }, callback?: (error: Error) => any): void;
    get(key: TKey, callback?: (error: Error, value: T) => any): void;

    get(key: TKey, options?: { keyEncoding?: string; fillCache?: boolean }, callback?: (error: Error, value: T) => any): void;
    del(key: TKey, callback?: (error: Error) => any): void;
    del(key: TKey, options?: { keyEncoding?: string; sync?: boolean }, callback?: (error: Error) => any): void;

    batch(array: Batch[], options?: { keyEncoding?: string; valueEncoding?: string; sync?: boolean }, callback?: (error?: Error) => any): void;
    batch(array: Batch[], callback?: (error?: Error) => any): void;
    batch(): LevelUpChain;
    isOpen(): boolean;
    isClosed(): boolean;
    createReadStream(options?: any): any;
    createKeyStream(options?: any): any;
    createValueStream(options?: any): any;
    createWriteStream(options?: any): any;
    destroy(location: string, callback?: Function): void;
    repair(location: string, callback?: Function): void;
}

/**Can't extend SubLevel is not a 'class'*/
export class Bucket<TKey, TValue> implements IBucket<TKey, TValue> {

    async: Azync<TKey, TValue>;

    level: Sublevel;

    constructor(
        prefix: string,
        private key: (x: TValue) => string,
        db: Sublevel) {
        //...    
        this.level = db.sublevel(prefix);

        const bucket = this;

        this.async = {

            get(key: TKey): Promise<TValue> {
                return new Promise((resolve, reject) => {
                    bucket.level.get(key, (e, data) => {
                        if (e) {
                            reject(e);
                            return;
                        }
                        resolve(data)
                    })
                })
            },

            put: (value: TValue): Promise<Bucket<TKey, TValue>> => {
                return new Promise((rs, rj) => {
                    bucket.level.put(bucket.key(value), value, (e) => {
                        if (e) { 
                            rj(e);
                             return; 
                        }
                        rs(bucket);
                    })
                })
            },

            del: (value: TValue): Promise<Bucket<TKey, TValue>> => {
                return new Promise((resolve, reject) => {
                    bucket.level.del(bucket.key(value), e => {
                        if (e) {
                            reject(e);
                            return;
                        }
                        resolve(bucket);
                    })
                });
            }
        }

        //LevelUp: 
        this.open = this.level.open;
        this.close = this.level.close;
        this.put = this.level.put as any;
        this.get = this.level.get;
        this.del = this.level.del;
        this.batch = this.level.batch;
        this.isOpen = this.level.isOpen;
        this.isClosed = this.level.isClosed;
        this.createReadStream = this.level.createReadStream;
        this.createKeyStream = this.level.createKeyStream;
        this.createValueStream = this.level.createValueStream
        this.createWriteStream = this.level.createWriteStream
        this.destroy = this.level.destroy;
        this.repair = this.level.repair;

        //Sublevel
        this.sublevel = this.level.sublevel;
        this.pre = this.level.pre;        
    }

    //LevelUp
    open: (callback?: (error: Error) => any) => void = null;
    close: (callback?: (error: Error) => any) => void;
    put: (x) => void = null;
    get: (x) => void = null;
    del: (x) => void = null;
    batch: () => LevelUpChain;
    isOpen: () => boolean;
    isClosed: () => boolean;
    createReadStream: (options) => any = null;
    createKeyStream: (options) => any = null;;
    createValueStream: (options) => any = null;
    createWriteStream: (options) => any = null;
    destroy: (location: string, callback?: Function) => void = null;
    repair: (location: string, callback?: Function) => void = null;

    //Sublevel
   	sublevel: (key: string) => Sublevel;
    pre: (hook: Hook) => Function;

}

export type Result<T> ={ error?:Error, value?:T};