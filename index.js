'use strict';

module.exports = Valve;

function Valve(
    defaultLimit = Infinity,
    controlEmitter = undefined
) {
    let realLimit = defaultLimit;
    let done = true;
    let count = 0;
    const todos = [];

    if (controlEmitter) {
        controlEmitter.on('close', (limit = 1) => {
            realLimit = limit;
            done = false;
        });

        controlEmitter.on('open', (limit) => {
            realLimit = limit || defaultLimit;
            done = true;
        });
    }

    return async (ctx, next) => {
        if (controlEmitter && count <= realLimit && !done) {
            done = true;
            controlEmitter.emit('done');
        }

        if (count >= realLimit) {
            await new Promise(resolve => todos.push(resolve));
        } else {
            ++count;
        }

        await next();
        --count;

        if (controlEmitter && count <= realLimit && !done) {
            done = true;
            controlEmitter.emit('done');
        }

        while (count < realLimit && todos.length) {
            ++count;
            todos.shift()();
        }
    };
}
