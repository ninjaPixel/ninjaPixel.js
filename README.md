ninjaPixel.js
=============

##Create reusable d3.js charts, without having to do the boring plumbing.

This is not a charting library. No charting library will ever be complete with all the various charts that you could want; if you are using d3.js then you know this already. Instead, this is a framework which handles the boring plumbing - like drawing axes, labels and setting dimensions - leaving you free to do the Hollywood coding.

See the wiki for how to use ninjaPixel.js


###Compiling the source

After cloning your fork of the ninjaPixel.js repository, from the terminal navigate to the `code` directory and install ninjaPixel's dependencies by running:

    npm install 

ninjaPixel is written in TypeScript; the `.ts` files are located in the `code\src` directory and the compiled ninjaPixel.js file is output to the `code\dir` directory. There is a `gruntfile` configured to compile the TypeScript files and concatenate them into a single JavaScript file. Again, from the `code` directory run

    grunt
    
This will create ninjaPixel.js and ninjaPixel.bundle.js. The later includes [d3.js](https://github.com/mbostock/d3) and the [d3-tip](https://github.com/Caged/d3-tip) extension.
