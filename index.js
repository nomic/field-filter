'use strict';
var _ = require('lodash');

module.exports = {
  filter: filter,
  parseFilter: parseFilter
};

function parseFilter(filterStr) {
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

  return _.transform(keys, function (result, key) {
    var top, rest;

    if (!_.contains(key, '(') && !_.contains(key, '/')) {
      result[key] = null;
      return;
    }

    if (/^[^(]+\//.test(key)) {
      top = key.slice(0, key.indexOf('/'));
      rest = key.slice(key.indexOf('/') + 1);
      result[top] = parseFilter(rest);
      return;
    }

    if (/^[^/]+\(/.test(key)) {
      top = key.slice(0, key.indexOf('('));
      rest = key.slice(key.indexOf('(') + 1, key.lastIndexOf(')'));
      result[top] = parseFilter(rest);
      return;
    }

  }, {});
}

function filter(filterStr, source, requiredStr) {
  var required = parseFilter(requiredStr);

  if (!containsRequired(required, source)) {
    return null;
  }

  return _filter(parseFilter(filterStr), source);
}

function containsRequired(required, source) {
  return _.every(required, function (subRequires, require) {
    if (source[require] === undefined) {
      return false;
    }
    return containsRequired(subRequires, source[require]);
  });
}

function _filter(fields, source) {
  if (!fields) {
    return source;
  }

  var hasNumber = _.any(Object.keys(fields), function (fieldName) {
    return !isNaN(parseInt(fieldName));
  });

  if (!hasNumber && Array.isArray(source)) {
    return _.map(source, _.partial(_filter, fields));
  }

  // fill specified keys
  var result = _.transform(fields, function (result, subFields, field) {
    if (field === '*') {
      if (subFields) {
        var usedKeys = Object.keys(result);
        _.forEach(_.keys(source), function (top) {
          if (!_.contains(usedKeys, top)) {
            result[top] = _filter(subFields, source[top]);
          }
        });
        return;
      }

      result = _.defaults(result, source);
      return;
    }

    if (source[field] === undefined) {
      return;
    }

    result[field] = _filter(subFields, source[field]);

    return;
  }, Array.isArray(source) ? [] : {});

  // replace empty array elements with `undefined` - arrays are odd like that
  return !Array.isArray(result) ? result : _.map(result, function (val) {
    if (_.isUndefined(val)) {
      return undefined;
    }
    return val;
  });
}
