ninjaPixel.js
=============

Create reusable d3.js charts, without having to do the boring plumbing.

After cloning your fork of the ninjaPixel.js repository, from the terminal navigate to the `code` directory and install ninjaPixel's dependencies by running:

    npm install 

ninjaPixel is written in TypeCcript. The `.ts` files are located in the source directory and the compiled ninjaPixel.js file is output to the `dir` directory. There is a `gruntfile` configured to compile the TypeScript files and concatenate them into a single `.js` file. Again, from the `code` directory run

    grunt
    
This will create ninjaPixel.js and ninjaPixel.bundle.js. The later includes d3.js and the d3-tooltip extension.
