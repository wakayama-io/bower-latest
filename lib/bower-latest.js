/*
 * bower-latest
 * https://github.com/kwakayama/bower-latest
 *
 * Copyright (c) 2014 Kentaro Wakayama
 * Licensed under the MIT license.
 */

'use strict';

var bower = require('bower'),
  request = require('request');

module.exports = function bowerLatest (packageName, options, cb) {

  if (typeof options === 'function') {
    cb = options;
  }

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
      var rawUrl = 'https://raw.githubusercontent.com/' + user + '/' + repo + '/master/bower.json';

      request(rawUrl, function (error, response, body) {
        var bowerJson;
        if (!error && response.statusCode === 200) {
          bowerJson = JSON.parse(body);
        }
        cb(bowerJson);
      });

  });

};
