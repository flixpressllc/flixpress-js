// generated on 2015-10-05 using generator-gulp-webapp 1.0.3

// node_modules requires:
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';
import rs from 'run-sequence';

// NodeJS level requires:
import fs from 'fs';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
var production = true;
var distribution = false;
const productionPath = '/Volumes/Don2/Scripts/flixpress-js';

/* I am doing this slightly different than suggested at https://github.com/nkostelnik/gulp-s3
   With my version, only the Key and Secret are in the JSON file. I can define the
   bucket here.

   The aws.json file ought to look like this:

   {
  "key": "SOMETHING",
  "secret": "SOMETHING ELSE"
   }
*/
var aws = JSON.parse(fs.readFileSync('./aws.json'));
aws.bucket = 'FlixSamples';
const awsCredentials = aws;
const awsOptions = {uploadPath: "development_files/Scripts/flixpress-js"}

gulp.task('styles', () => {
  return gulp.src('app/styles/*.{scss,sass}')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe( $.if( production, 
      gulp.dest(productionPath + '/styles'), 
      $.s3(awsCredentials,{uploadPath: awsOptions.uploadPath + "/styles"}) ) )
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
    mocha: true
  }
};

gulp.task('lint', lint('app/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html', ['styles'], () => {
  const assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')({
    filter: '**/*.{eot,svg,ttf,woff,woff2}'
  }).concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'fonts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    'app/**/*.js',
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});

gulp.task('requirejs', () => {
  let dir = production ? 'app' : '.tmp';
  
  return gulp.src(dir + '/lib/flixpress.js')
    .pipe($.plumber({errorHandler: $.notify.onError("Error: <%= error.message %>")}))
    .pipe($.requirejsOptimize({
      optimize: 'none',
      mainConfigFile: dir + '/lib/config.js',
      name: 'flixpress',
      insertRequire: ['flixpress']
    }))
    .pipe($.wrap('(function () {<%= contents %>}());'))
    .pipe($.addSrc.prepend('bower_components/almond/almond.js'))
    .pipe($.concat('flixpress.js'))
    .pipe(gulp.dest('.tmp'))
    .pipe( $.if(production,
      gulp.dest(productionPath),
      $.s3(awsCredentials, awsOptions) ) )
});

gulp.task('uglify-for-dist', () => {
  return gulp.src('.tmp/flixpress.js')
    .pipe($.uglify())
    .pipe($.concat('flixpress.min.js'))
    .pipe(gulp.dest(productionPath))
});

gulp.task('kickoff', ['clean'], () => {
  let requireCall = production ? 'requirejs' : 'dev-requirejs';
  requireCall = distribution ? 'production-requirejs' : requireCall;
  
  gulp.watch('app/**/*.js', [requireCall]);
  gulp.watch('app/styles/*.{scss,sass}', ['styles']);
});

gulp.task('dev-requirejs', () => {
  rs('dev-replace', 'requirejs')
});

gulp.task('production-requirejs', () => {
  rs('requirejs', 'uglify-for-dist')
});

gulp.task('dev-replace', () => {
  // 1. get the files
  // 2. replace the contents
  // 3. put in .tmp
  let toUncomment = /\/\*d->\s*(.+?)\s*<-d\*\//g;
  return gulp.src('app/lib/**/*.js')
    .pipe($.replace(toUncomment, '$1'))
    .pipe(gulp.dest('.tmp/lib'));
});

gulp.task('production', () => {
  production = true;
  rs('kickoff');
});
gulp.task('development', () => {
  production = false;
  rs('kickoff');
});
gulp.task('production:dist', () => {
  production = true;
  distribution = true;
  rs('kickoff');
});
