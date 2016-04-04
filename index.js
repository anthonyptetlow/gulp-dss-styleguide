'use strict';

var through = require('through2');
// var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var dss = require('dss');
var Twig = require('twig');
var twig = Twig.twig;

var twigOpts = {
                path: './templates/default/style.twig',
                async: false
            };

// file can be a vinyl file object or a string
// when a string it will construct a new one
module.exports = function(file, opt) {
  // if (!file) {
  //   throw new PluginError('gulp-concat', 'Missing file option for gulp-concat');
  // }

  opt = opt || {};


  var styleguide = []


  function bufferContents(file, encoding, callback) {
    // ignore empty files
    if (file.isNull()) {
      callback();
      return;
    }

    // we don't do streams (yet)
    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-styleguide',  'Streaming not supported'));
      cb();
      return;
    }

    dss.parse(file.contents.toString(), {}, function (parsed) {

      // Add filename
      parsed.file = file.path

      var template =  twig(twigOpts);
      var rendercontents = template.render(parsed);

      var path = (parsed.blocks[0].name + '.html').replace(' ', '');
      var temp = new File({ path: path, contents: new Buffer(rendercontents) })
      styleguide.push(parsed)

      callback(null, temp)
      // Add file to styleguide object
    });

  }

  function endStream(callback) {
      // Add filename
      // var contents = JSON.stringify(styleguide);
      // var path = ('test.html').replace(' ', '');
      // var temp = new File({ path: path, contents: new Buffer(contents) })
      // callback(null, temp);
      callback();
  }

  return through.obj(bufferContents, endStream);
};
