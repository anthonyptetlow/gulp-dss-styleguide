'use strict';

var through = require('through2');
// var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var dss = require('dss');
var Twig = require('twig');

// Disable twig caching
Twig.cache(false);

var twig = Twig.twig;


// file can be a vinyl file object or a string
// when a string it will construct a new one
module.exports = function(opt) {
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

        dss.parse(file.contents.toString(), {}, function (page) {


            page.blocks = page.blocks.filter(function (block) {
                return typeof block['styleguide'] !== 'undefined';
            });

            if(page.blocks.length > 0) {


                // Add filename
                page.file = file.path

                if(opt.transformFileName) {
                    page.url = opt.transformFileName(page.file)
                } else {
                    page.url = page.file;
                }

                page.url = page.url.replace(file.cwd + '/', '').replace(/\.(css|less|scss|sass)/g, '.html');

                page.title = page.url.replace(/\.(css|less|scss|sass|html)/g, '').split('/').filter(function (item) { return item !== ''}).pop().replace(/_/g, ' ').trim();
                styleguide.push(page)
            }

            callback(null);
        });
    }

    function endStream(callback) {
        var templateCss =  twig({
            path: opt.templates.guide || './node_modules/gulp-styleguide/templates/default/style.twig',
            async: false
        });

        var templateHome =  twig({
            path: opt.templates.home || './node_modules/gulp-styleguide/templates/default/home.twig',
            async: false
        });

        var g = this;
        styleguide.sort(function(a, b) {
            var textA = a.title.toUpperCase();
            var textB = b.title.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });

        // Generate css guide pages
        styleguide.forEach(function (page) {
            var rendercontents = templateCss.render({blocks: page.blocks, styleguide: styleguide});
            var temp = new File({ path: page.url, contents: new Buffer(rendercontents) })
            g.push(temp);
        });

        //Generate index page
        var rendercontents = templateHome.render({styleguide: styleguide});
        var temp = new File({ path: 'index.html', contents: new Buffer(rendercontents) })
            g.push(temp);

        callback();
    }

    return through.obj(bufferContents, endStream);
};
