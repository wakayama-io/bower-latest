/*
 * bower-latest
 * https://github.com/kwakayama/bower-latest
 *
 * Copyright (c) 2014 Kentaro Wakayama
 * Licensed under the MIT license.
 */

'use strict';

var bower = require('bower'),
  util = require('util'),
  request = require('request'),
  _ = require('lodash');

var GITHUB_URL = 'https://api.github.com/repos/%s/%s/tags';

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

  bower.commands
  .search(packageName, {})
  .on('end', function (results) {
      if (results.length === 0) {
        console.log('no bower package found');
        return cb();
      }

      var gitUrl = results[0].url;
      // TODO refactor
      var data = gitUrl.split('git://github.com/')[1].split('.git')[0].split('/');
      var user = data[0];
      var repo = data[1];
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
