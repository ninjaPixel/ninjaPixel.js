module.exports = function (grunt) {
    var myDir = 'src';
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
                src: ['src/js/d3.tip.js',
                    'src/js/chart.js',
                    'src/js/barChart.js',
                    'src/js/horizontalBarChart.js',
                    'src/js/groupedBarChart.js',
                    'src/js/groupedInterquartileChart.js',
                    'src/js/stackedBarChart.js',
                    'src/js/bubbleChart.js',
                    'src/js/lineChart.js',
                    'src/js/histogram.js',
                    'src/js/donut.js',
                    'src/js/lollipop.js',
                    'src/js/simpleTreemap.js',
                    'src/js/treemap.js'
                ],
                dest: 'dist/ninjaPixel.js',
            },
            bundle: {
                src: ['node_modules/d3/build/d3.js', 'node_modules/d3-selection-multi/build/d3-selection-multi.js', 'node_modules/d3-tip/index.js', 'dist/ninjaPixel.js'],
                dest: 'dist/ninjaPixel.bundle.js',
            }
        },
        ts: {
            default: {
                // specifying tsconfig as a boolean will use the 'tsconfig.json' in same folder as Gruntfile.js
                tsconfig: true,
                "outDir": "./src/js"
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