module.exports = function (grunt) {
    var myDir = 'src'; // this will change to 'src/' once branch work is complete
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            typescript: {
                files: ['src/*.ts', '!src/*.d.ts'],
                tasks: ['default'],
            }
        },
        concat: {
            options: {
                //                separator: ';',
            },
            basic: {
                src: ['src/js/d3.tip.js', 'src/js/chart.js', 'src/js/barChart.js','src/js/groupedBarChart.js', 'src/js/stackedBarChart.js', 'src/js/bubbleChart.js', 'src/js/lineChart.js', 'src/js/histogram.js', 'src/js/donut.js', 'src/js/lollipop.js', 'src/js/simpleTreemap.js', 'src/js/treemap.js'],
                dest: 'dist/ninjaPixel.js',
            },
            bundle: {
                src: ['node_modules/d3/d3.js', 'src/js/d3.tip.js', 'dist/ninjaPixel.js'],
                dest: 'dist/ninjaPixel.bundle.js',
            }
        },
        ts: {
            default: {
                src: ['src/*.ts', '!src/*.d.ts'],
                options: {
                    declaration: false, // set to true to crete .d.ts files
                    sourceMap: false // set to true to create map files
                },
                outDir: 'src/js'
            }
        },
        rename: {
            moveDefinitions: {
                src: 'src/js/*.d.ts',
                dest: 'src/typescript_definitions/'
            }
        },
        uglify: {
            my_target: {
                files: {
                    'dist/ninjapixel.bundle.min.js': ['dist/ninjapixel.bundle.js']
      }
    }
  }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-rename');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['ts', 'concat', 'uglify']);
};