// function clone(obj) {
//     var copy = Array.isArray(obj) ? [] : {};
//     for (var i in obj) {
//         if (Array.isArray(obj[i])) {
//             copy[i] = obj[i].slice(0);
//         } else if (obj[i] instanceof Buffer) {
//             copy[i] = obj[i].slice(0);
//         } else if (typeof obj[i] != 'function') {
//             copy[i] = obj[i] instanceof Object ? clone(obj[i]) : obj[i];
//         } else if (typeof obj[i] === 'function') {
//             copy[i] = obj[i];
//         }
//     }
//     return copy;
// }

// import clone from 'winston/lib/winston/common';
// // require("winston/lib/winston/common").clone = clone;

// import * as Transport from 'winston-transport';


// Transport.prototype.normalizeQuery = function (options) {  //
//     options = options || {};

//     // limit
//     options.rows = options.rows || options.limit || 10;

//     // starting row offset
//     options.start = options.start || 0;

//     // now
//     options.until = options.until || new Date;
//     if (typeof options.until !== 'object') {
//         options.until = new Date(options.until);
//     }

//     // now - 24
//     options.from = options.from || (options.until - (24 * 60 * 60 * 1000));
//     if (typeof options.from !== 'object') {
//         options.from = new Date(options.from);
//     }

//     // 'asc' or 'desc'
//     options.order = options.order || 'desc';

//     // which fields to select
//     options.fields = options.fields;

//     return options;
// };
// Transport.prototype.formatResults = function (results, options) {
//     return results;
// };