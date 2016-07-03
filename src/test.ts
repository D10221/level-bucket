import {assert} from 'chai';
import * as path from 'path';
import * as LevelUp from 'levelup';
import * as Sublevel from 'level-sublevel';

import {Data, User} from './data';


describe('what', () => {

    it('delete', async ()=>{
        const data = new Data(/*Memdown*/);
        const users = data.users.async;
        let admin = await users.get('admin').catch(e=> null);        
        assert.isNull(admin);
        await users.put({ name: 'admin'});
        admin = await users.get('admin').catch(e=> null);
        await data.users.async.del(admin);
        admin = await users.get('admin').catch(e=> null);
        assert.isNull(admin);
    })

    it('has Keys', async () => {

        const data = new Data(/*Memdown*/);                
        await data.users.async.put({name:'admin'});                        
        await data.users.put('bob', { name: 'bob'});
        await data.users.put('guest', { name: 'guest' });
        
        let closed = false;
        let end = false;        
        let keys = [];

        data.users.createKeyStream()
            .on('data', key => {
                keys.push(key);
            })
            .on('close', () => {
                closed = true;
            })
            .on('end', () => {
                end = true;
            });

        await wait(250);

        assert.isTrue(closed);
        assert.isTrue(end);
        assert.deepEqual(keys, ['admin', 'bob', 'guest']);
    })
})
const wait = (n)=> new Promise(r=> setTimeout(r, n));