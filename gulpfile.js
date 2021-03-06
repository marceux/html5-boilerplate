var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')(); // Load all gulp plugins
                                              // automatically and attach
                                              // them to the `plugins` object

var runSequence = require('run-sequence');    // Temporary solution until gulp 4
                                              // https://github.com/gulpjs/gulp/issues/355

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', function () {
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', function (done) {

    var archiveName = path.resolve(dirs.archive, pkg.name + '_v' + pkg.version + '.zip');
    var archiver = require('archiver')('zip');
    var files = require('glob').sync('**/*.*', {
        'cwd': dirs.dist,
        'dot': true // include hidden files
    });
    var output = fs.createWriteStream(archiveName);

    archiver.on('error', function (error) {
        done();
        throw error;
    });

    output.on('close', done);

    files.forEach(function (file) {

        var filePath = path.resolve(dirs.dist, file);

        // `archiver.bulk` does not maintain the file
        // permissions, so we need to add files individually
        archiver.append(fs.createReadStream(filePath), {
            'name': file,
            'mode': fs.statSync(filePath)
        });

    });

    archiver.pipe(output);
    archiver.finalize();

});

gulp.task('clean', function (done) {
    require('del')([
        dirs.archive,
        dirs.dist
    ], done);
});

gulp.task('copy', [
    'copy:.htaccess',
    'copy:index.html',
    'copy:jquery',
    'copy:main.css',
    'copy:bootstrap-css',
    'copy:bootstrap-glyph1',
    'copy:bootstrap-glyph2',
    'copy:bootstrap-glyph3',
    'copy:bootstrap-glyph4',
    'copy:bootstrap-js',
    'copy:fa-css',
    'copy:fa-font1',
    'copy:fa-font2',
    'copy:fa-font3',
    'copy:fa-font4',
    'copy:misc'
]);

gulp.task('copy:.htaccess', function () {
    return gulp.src('node_modules/apache-server-configs/dist/.htaccess')
               .pipe(plugins.replace(/# ErrorDocument/g, 'ErrorDocument'))
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:index.html', function () {
    return gulp.src(dirs.src + '/index.html')
               .pipe(plugins.replace(/{{JQUERY_VERSION}}/g, pkg.devDependencies.jquery))
               .pipe(plugins.replace(/{{BOOTSTRAP_VERSION}}/g, pkg.devDependencies.bootstrap))
               .pipe(plugins.replace(/{{FONTAWESOME_VERSION}}/g, pkg.devDependencies['font-awesome']))
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:jquery', function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
               .pipe(plugins.rename('jquery-' + pkg.devDependencies.jquery + '.min.js'))
               .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:bootstrap-css', function () {
    return gulp.src(['node_modules/bootstrap/dist/css/bootstrap.min.css'])
                .pipe(plugins.rename('bootstrap-' + pkg.devDependencies.bootstrap + '.min.css'))
                .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('copy:bootstrap-glyph1', function () {
    return gulp.src(['node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.eot'])
                .pipe(plugins.rename('glyphicons-halflings-regular.eot'))
                .pipe(gulp.dest(dirs.dist + '/fonts'));
});

gulp.task('copy:bootstrap-glyph2', function () {
    return gulp.src(['node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.svg'])
                .pipe(plugins.rename('glyphicons-halflings-regular.svg'))
                .pipe(gulp.dest(dirs.dist + '/fonts'));
});

gulp.task('copy:bootstrap-glyph3', function () {
    return gulp.src(['node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf'])
                .pipe(plugins.rename('glyphicons-halflings-regular.ttf'))
                .pipe(gulp.dest(dirs.dist + '/fonts'));
});

gulp.task('copy:bootstrap-glyph4', function () {
    return gulp.src(['node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.woff'])
                .pipe(plugins.rename('glyphicons-halflings-regular.woff'))
                .pipe(gulp.dest(dirs.dist + '/fonts'));
});

gulp.task('copy:bootstrap-js', function () {
    return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js'])
                .pipe(plugins.rename('bootstrap-' + pkg.devDependencies.bootstrap + '.min.js'))
                .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:fa-css', function () {
    return gulp.src(['node_modules/font-awesome/css/font-awesome.min.css'])
                .pipe(plugins.rename('font-awesome-' + pkg.devDependencies['font-awesome'] + '.min.css'))
                .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('copy:fa-font1', function () {
    return gulp.src(['node_modules/font-awesome/fonts/FontAwesome.otf'])
                .pipe(plugins.rename('fontawesome-webfont.otf'))
                .pipe(gulp.dest(dirs.dist + '/fonts'));
});

gulp.task('copy:fa-font2', function () {
    return gulp.src(['node_modules/font-awesome/fonts/fontawesome-webfont.eot'])
                .pipe(plugins.rename('fontawesome-webfont.eot'))
                .pipe(gulp.dest(dirs.dist + '/fonts'));
});

gulp.task('copy:fa-font3', function () {
    return gulp.src(['node_modules/font-awesome/fonts/fontawesome-webfont.svg'])
                .pipe(plugins.rename('fontawesome-webfont.svg'))
                .pipe(gulp.dest(dirs.dist + '/fonts'));
});

gulp.task('copy:fa-font4', function () {
    return gulp.src(['node_modules/font-awesome/fonts/fontawesome-webfont.ttf'])
                .pipe(plugins.rename('fontawesome-webfont.ttf'))
                .pipe(gulp.dest(dirs.dist + '/fonts'));
});

gulp.task('copy:fa-font5', function () {
    return gulp.src(['node_modules/font-awesome/fonts/fontawesome-webfont.woff'])
                .pipe(plugins.rename('fontawesome-webfont.woff'))
                .pipe(gulp.dest(dirs.dist + '/fonts'));
});

gulp.task('copy:main.css', function () {

    var banner = '/*! HTML5 Boilerplate v' + pkg.version +
                    ' | ' + pkg.license.type + ' License' +
                    ' | ' + pkg.homepage + ' */\n\n';

    return gulp.src(dirs.src + '/css/main.css')
               .pipe(plugins.header(banner))
               .pipe(gulp.dest(dirs.dist + '/css'));

});

gulp.task('copy:misc', function () {
    return gulp.src([

        // Copy all files
        dirs.src + '/**/*',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + dirs.src + '/css/main.css',
        '!' + dirs.src + '/index.html'

    ], {

        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist));
});

gulp.task('lint:js', function () {
    return gulp.src([
        'gulpfile.js',
        dirs.src + '/js/*.js',
        dirs.test + '/*.js'
    ]).pipe(plugins.jscs())
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.jshint.reporter('fail'));
});


// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('archive', function (done) {
    runSequence(
        'build',
        'archive:create_archive_dir',
        'archive:zip',
    done);
});

gulp.task('build', function (done) {
    runSequence(
        ['clean', 'lint:js'],
        'copy',
    done);
});

gulp.task('default', ['build']);
