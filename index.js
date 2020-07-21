'use strict';

module.exports = Valve;

function Valve(emitter) {

    let count = 0;
    const todos = [];
    let limit = Infinity;
    let done = true;

    emitter.on('close', (_limit = 1) => {
        limit = _limit;
        done = false;
    });

    emitter.on('open', (tmp) => {
        console.log(tmp);
        limit = Infinity;
        done = true;
    });

    return async (ctx, next) => {
        if (count <= limit && !done) {
            done = true;
            emitter.emit('done');
        }

        if (count >= limit) {
            await new Promise(resolve => todos.push(resolve));
        } else {
            ++count;
        }

        await next();
        --count;

        if (count <= limit && !done) {
            done = true;
            emitter.emit('done');
        }

        while (count < limit && todos.length) {
            ++count;
            todos.shift()();
        }
    };
}
