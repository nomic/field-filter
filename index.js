'use strict';
var _ = require('lodash');

module.exports = filter;

function filter(filterStr, source) {
  if (!filterStr) {
    return source;
  }

  if (isNaN(parseInt(filterStr[0])) && Array.isArray(source)) {
    return _.map(source, _.partial(filter, filterStr));
  }

  var openParens = 0;
  var keys = _.filter(_.map(_.reduce(filterStr, function (result, letter) {
    if (letter === ',' && openParens === 0) {
      return result.concat('');
    }

    if (letter === '(') {
      openParens += 1;
    }
    if (letter === ')') {
      openParens -= 1;
    }

    result[result.length - 1] += letter;
    return result;
  }, ['']), function (key) {
    return key.trim();

  // put * at the end, if it exists
  })).sort().reverse();

  // fill specified keys
  var result = _.transform(keys, function (result, key) {
    var top, rest, usedKeys;

    if (/^[^(*]+\//.test(key)) {
      top = key.slice(0, key.indexOf('/'));
      rest = key.slice(key.indexOf('/') + 1);
      result[top] = filter(rest, source[top]);
      return;
    }
    if (/^[^/*]+\(/.test(key)) {
      top = key.slice(0, key.indexOf('('));
      rest = key.slice(key.indexOf('(') + 1, key.lastIndexOf(')'));
      result[top] = filter(rest, source[top]);
      return;
    }

    if (/^\*/.test(key)) {
      if (key === '*') {
        result = _.defaults(result, source);
        return;
      }

      if (/^\*\//.test(key)) {
        usedKeys = Object.keys(result);
        rest = key.slice(key.indexOf('/') + 1);
        _.forEach(_.keys(source), function (top) {
          if (!_.contains(usedKeys, top)) {
            result[top] = filter(rest, source[top]);
          }
        });
        return;
      }

      if (/^\*\(/.test(key)) {
        usedKeys = Object.keys(result);
        rest = key.slice(key.indexOf('(') + 1, key.lastIndexOf(')'));
        _.forEach(_.keys(source), function (top) {
          if (!_.contains(usedKeys, top)) {
            result[top] = filter(rest, source[top]);
          }
        });
        return;
      }
      return;
    }

    result[key] = source[key];
  }, Array.isArray(source) ? [] : {});

  // replace empty array elements with `undefined` - arrays are odd like that
  return !Array.isArray(result) ? result : _.map(result, function (val) {
    if (_.isUndefined(val)) {
      return undefined;
    }
    return val;
  });
}
