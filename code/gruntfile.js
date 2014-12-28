module.exports = function (grunt) {
    var myDir = 'src3'; // this will change to 'src/' once branch work is complete
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                //                separator: ';',
            },
            basic: {
                src: [myDir + '/js/_chart.js', myDir + '/js/barChart.js', myDir + '/js/bubbleChart.js', myDir + '/js/lineChart.js' ],
                dest: 'dist/ninjaPixel.js',
            },
            bundle: {
                src: ['node_modules/d3/d3.js', '../../d3-tip/index.js', 'node_modules/moment/moment.js', 'dist/ninjaPixel.js', myDir + '/js/bubbleChart.js', myDir + '/js/lineChart.js'],
                dest: 'dist/ninjaPixel.bundle.js',
            }
        },
        ts: {
            default: {
                src: [myDir + '/*.ts', '!' + myDir + '/*.d.ts'],
                options: {
                    declaration: false, // set to true to crete .d.ts files
                    sourceMap: false // set to true to create map files
                },
                outDir: myDir + '/js'
            }
        },
        rename: {
            moveDefinitions: {
                src: myDir + '/js/*.d.ts',
                dest: myDir + '/typescript_definitions/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-rename');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['ts', 'concat']);
    //    grunt.registerTask('default', ['ts', 'rename']);

};