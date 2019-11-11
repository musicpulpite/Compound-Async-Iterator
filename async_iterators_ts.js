"use strict";
exports.__esModule = true;
var es6_promise_1 = require("es6-promise");
function asyncIterator_ts(resource, limit) {
    if (limit === void 0) { limit = 10; }
    var id = 1;
    return {
        next: function () { return new es6_promise_1.Promise(function (resolve, reject) {
            setTimeout(function () {
                fetch("" + resource + id)
                    .then(function (response) { return response.json(); })
                    .then(function (json) {
                    if (id <= limit) {
                        id++;
                        resolve({
                            value: json,
                            done: false
                        });
                    }
                    else {
                        resolve({
                            value: undefined,
                            done: true
                        });
                    }
                })["catch"](function (error) { return reject(error); });
            }, Math.random() * 5000);
        }); }
    };
}
;
function compoundAsyncIterator_ts(asyncIterators, iteratorCallbacks) {
    var doneCount = 0;
    var iteratorMapper = function (iterator, idx) {
        return iterator.next()
            .then(function (resolvedValue) {
            var callback = iteratorCallbacks[idx];
            if (callback && typeof callback === 'function') {
                callback(resolvedValue);
            }
            return { idx: idx, resolvedValue: resolvedValue };
        });
    };
    var iteratorPromises = asyncIterators.map(iteratorMapper);
    var iteratorRace = function (resolve, reject) { return es6_promise_1.Promise.race(iteratorPromises)
        .then(function (_a) {
        var idx = _a.idx, resolvedValue = _a.resolvedValue;
        if (!resolvedValue.done) {
            iteratorPromises[idx] = iteratorMapper(asyncIterators[idx], idx);
            resolve(resolvedValue);
        }
        else {
            doneCount++;
            if (doneCount === asyncIterators.length) {
                resolve({ value: undefined, done: true });
            }
            else {
                iteratorPromises[idx] = new es6_promise_1.Promise(function (resolve, reject) { });
                return iteratorRace(resolve, reject);
            }
        }
    })["catch"](function (error) { return reject(error); }); };
    return {
        next: function () { return new es6_promise_1.Promise(function (resolve, reject) {
            return iteratorRace(resolve, reject);
        }); }
    };
}
;
