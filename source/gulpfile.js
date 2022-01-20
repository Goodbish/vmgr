const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const gulpif = require('gulp-if');
const argv = require('yargs').argv;
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const del = require('del');
const fileinclude = require('gulp-file-include');
const scssStyle = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const gcmq = require('gulp-group-css-media-queries');

const project_folder = 'dist';
const source_folder = '.';
const path = {
    build: {
        html: project_folder + '/',
        css: project_folder + '/assets/css/',
        scss: project_folder + '/assets/scss/',
        scripts: project_folder + '/assets/js/',
        images: project_folder + '/assets/img/',
        fonts: project_folder + '/assets/fonts/',
        videos: source_folder + '/assets/video/',
    },
    src: {
        html: [source_folder + '/html/**/*.html', '!' + source_folder + '/_*.html'],
        css: source_folder + '/assets/scss/style.scss',
        scss: source_folder + '/assets/scss/**/*.scss',
        scripts: source_folder + '/src/app.js',
        images: source_folder + '/assets/img/**/*.{jpg,png,svg,gif,ico,webp,mp4}',
        fonts: source_folder + '/assets/fonts/*.ttf',
        sprite: source_folder + '/assets/img/icons/**/*.svg',
        videos: source_folder + '/assets/video/*.mp4',
    },
    watch: {
        html: source_folder + '/html/**/*.html',
        styles: source_folder + '/assets/scss/**/*.scss',
        scripts: source_folder + '/src/**/*.js',
        images: source_folder + '/assets/img/**/*.{jpg,png,gif,ico,webp,svg}',
        sprite: source_folder + '/assets/img/icons/**/*.svg',
        videos: source_folder + '/assets/video/*.mp4',
    },
    clean: './' + project_folder + '/',
};

exports.browser = browser;
exports.html = html;
exports.css = css;
exports.scss = scss;
exports.scripts = scripts;
exports.images = images;
exports.media = media;
exports.startwatch = startwatch;
exports.default = series(
    clean,
    parallel(html, css, scss, scripts, images, spriteSvg),
    // gulpif(argv.prod, media),
    parallel(browser, startwatch)
);

function startwatch() {
    watch([path.watch.html], html);
    watch([path.watch.styles], css);
    watch([path.watch.scripts], scripts);
    watch([path.watch.images], images);
    watch([path.watch.sprite], spriteSvg);
}

function browser() {
    browserSync.init({
        server: {
            baseDir: './' + project_folder + '/',
        },
        notify: false,
        online: true,
    });
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream());
}

function css() {
    return src(path.src.css)
        .pipe(plumber())
        .pipe(gulpif(!argv.prod, sourcemaps.init()))
        .pipe(scssStyle())
        .pipe(gulpif(!argv.prod, concat('style.css'), concat('style.min.css')))
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 10 version'],
                grid: true,
            })
        )
        .pipe(
            gulpif(
                argv.prod,
                cleanCSS(
                    {
                        level: {
                            2: {
                                all: true,
                                specialComments: 0,
                            },
                        },
                        compatibility: '*',
                        debug: true,
                    },
                    (details) => {
                        console.log(
                            `${details.name}: ${details.stats.originalSize}`
                        );
                        console.log(
                            `${details.name}: ${details.stats.minifiedSize}`
                        );
                    }
                )
            )
        )
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream());
}

function scripts() {
    return (
        src(path.src.scripts)
            .pipe(fileinclude())
            .pipe(gulpif(argv.prod, uglify()))
            .pipe(
                gulpif(argv.prod, concat('script.min.js'), concat('script.js'))
            )
            .pipe(dest(path.build.scripts))
            .pipe(browserSync.stream())
    );
}

function images() {
    return src(path.src.images)
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [
                    {
                        removeViewBox: false,
                    },
                ],
                interlaced: true,
                optimizationLevel: 3, // 0 to 7
            })
        )
        .pipe(dest(path.build.images))
        .pipe(browserSync.stream());
}

function spriteSvg() {
    return src(path.src.sprite)
        .pipe(
            svgSprite({
                mode: {
                    symbol: {
                        sprite: '../icons/sprite.svg',
                    },
                },
            })
        )
        .pipe(dest(path.build.images))
        .pipe(browserSync.stream());
}

function scss() {
    return src(path.src.scss)
        .pipe(gulpif(argv.prod, dest(path.build.scss)))
}

function media() {
    return src(path.build.css)
        .pipe(gcmq())
        .pipe(dest(path.build.css));
}

function clean() {
    return del(path.clean);
}
