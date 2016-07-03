import {assert} from 'chai';
import * as path from 'path';
import * as LevelUp from 'levelup';
import * as Sublevel from 'level-sublevel';

import {Data, User} from './data';


describe('what', () => {

    it('works', async () => {

        const data = new Data(path.join(process.cwd(), 'db'));

        let admin: User;

        try {
            admin = await data.users.async.get('admin');
        } catch (error) {
            console.log(error.message);
        }

        if (!admin) {
            console.log(`admin is not there`);
            await data.users.async.put({ name: 'admin' });
        } else {
            await data.users.async.del(admin);
            console.log('deleted');
            await data.users.async.put({ name: 'admin' });
            console.log('added');
        }

        console.log(admin);

        assert.deepEqual(admin, { name: 'admin' });

        data.users.put('bob', { name: 'bob', email: 'bob@mail', password: 'bob', roles: ['user'] });
        data.users.put('guest', { name: 'guest' });

        data.users.createKeyStream()
            .on('data', data => {
                console.log(`key:${data}`);;
            })
            .on('close', ()=>{
                console.log('close');
            })
            .on('end', ()=>{
                console.log('end');
            });
    })
})


