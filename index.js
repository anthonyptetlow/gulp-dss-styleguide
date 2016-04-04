'use strict';

var through = require('through2');
// var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var dss = require('dss');
var Twig = require('twig');
var twig = Twig.twig;


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
            this.emit('error', new PluginError('gulp-dss-styleguide',  'Streaming not supported'));
            cb();
            return;
        }

        var temp;

        dss.parse(file.contents.toString(), {}, function (parsed) {

            // Add filename
            parsed.file = file.path

            styleguide.push(parsed)

            callback(null);
        });
    }

    function endStream(callback) {
        var template =  twig({
            path: opt.template || './templates/default/style.twig',
            async: false
        });

        var g = this;



        styleguide.forEach(function (page) {
            page.url = page.file.replace(__dirname + '/', '').replace(/\.(css|less|scss|sass)/g, '.html');
            page.title = page.file.replace(__dirname + '/', '').replace(/\.(css|less|scss|sass)/g, '').split('/').filter(function (item) { return item !== ''}).pop();
        });

        styleguide.forEach(function (page) {

            var rendercontents = template.render({blocks: page.blocks, styleguide: styleguide});

            var temp = new File({ path: page.url, contents: new Buffer(rendercontents) })
            g.push(temp);
        });

        callback();
    }

    return through.obj(bufferContents, endStream);
};
