/*
 * bower-latest
 * https://github.com/kwakayama/bower-latest
 *
 * Copyright (c) 2014 Kentaro Wakayama
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util'),
  request = require('request'),
  _ = require('lodash');

var API_URL = 'https://bower-component-list.herokuapp.com';
var GITHUB_URL = 'https://api.github.com/repos/%s/%s/tags';

function findBowerPackage (packageName, cb) {
  request(API_URL, function(error, response, body) {
    if (response) {
      var name = packageName.toLowerCase();
      var list = JSON.parse(body);
      var exact = _.findIndex(list, function(item) {
        return item.name.toLowerCase() === name;
      });
      if (exact !== -1) {
        cb(list[exact]);
      } else {
        cb();
      }
    }
  });
}

module.exports = function bowerLatest (packageName, options, cb) {

  if (typeof options === 'function') {
    cb = options;
  }

  // Default request options
  var defaults = {
    headers: {
      'User-Agent': 'npm-search-v2'
    }
  };

  // Merge options with defaults
  options = _.merge(defaults, options);

  findBowerPackage(packageName, function (bowerPackage) {
    if (!bowerPackage) {
      return cb();
    }
    var gitUrl = bowerPackage.website;
    var data = gitUrl.split('/').slice(3,5);
    var user = data[0];
    var repo = data[1].replace('.git','');
    options.url = util.format(GITHUB_URL, user, repo);

    request(options, function (error, response, body) {
      var compontent;
      if (!error && response.statusCode === 200) {
        var tags = JSON.parse(body);
        compontent = {
          name: packageName,
          version: tags[0].name
        };
      }
      cb(compontent);

    });
  });

};
