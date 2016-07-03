import * as LevelUp from 'levelup';
import * as leveldown from 'leveldown';
import * as Sublevel from 'level-sublevel';

import * as bucket from './';
import IBucket = bucket.IBucket;
import Bucket = bucket.Bucket;

export class Data {

    private _db: Sublevel;

    constructor(dbPath?: string) {

        this._db = Sublevel(LevelUp(dbPath || './', {
            db: dbPath ? leveldown : require('memdown'),
            valueEncoding: 'json'
        }));

        this.users = new Bucket<string,User>('user', u => u.name, this._db);
    }

    users: IBucket<String,User>;
}

export interface User {
    //@Key
    name: string;
    password?: string;
    email?: string;
    roles?: string[];
}