module.exports = function (grunt) {
    var myDir = 'src'; // this will change to 'src/' once branch work is complete
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                //                separator: ';',
            },
            basic: {
                src: ['src/js/chart.js', 'src/js/barChart.js', 'src/js/bubbleChart.js', 'src/js/lineChart.js'],
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
                    sourceMap:   false // set to true to create map files
                },
                outDir: 'src/js'
            }
        },
        rename: {
            moveDefinitions: {
                src:  'src/js/*.d.ts',
                dest: 'src/typescript_definitions/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-rename');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['ts', 'concat']);
};