var gulp = require("gulp");
var styleguide = require("./index.js");


gulp.task('default', function() {
	return gulp.src('./examples/**/*.css')
		.pipe(styleguide({
			template: 'templates/default/style.twig'
		}))
		.pipe(gulp.dest('./results/'));
});
