import * as moment from 'moment';
import pupa = require('pupa');

String.prototype.format = function(data) {
  return pupa(this, data);
};

String.prototype.toMaskUid = function() {
  return this.replace(/^(\w{3})\w{4}/, '$1****');
};

Date.prototype.format = function(template?: string) {
  return moment(this).format(template || 'YYYY-MM-DD HH:mm:ss');
};

Array.prototype.groupBy = function(prop: string) {
  if (!prop) {
    throw new Error('Array.groupBy need property name');
  }
  return this.reduce(function(groups, item) {
    const key = item[prop];
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {});
};

Array.prototype.first = function() {
  if (!Array.isArray(this) || this.length < 1) {
    return undefined;
  }

  return this[0];
};

JSON.tryStringify = function(
  value: any,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
) {
  try {
    return JSON.stringify(value, replacer, space);
  } catch {
    return undefined;
  }
};

JSON.tryParse = function(
  text: string,
  reviver?: (this: any, key: string, value: any) => any,
) {
  try {
    return JSON.parse(text, reviver);
  } catch {
    return undefined;
  }
};
