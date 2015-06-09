rm -rf dist :- removes dist directory.
mkdir -p dist :- creates dist directory.
mkdir css :- creates css folder inside dist.
cp -R app/css/*.css dist/css :- copies .css file from app/css directory to dist/css directory.
cp -R app/resources dist/ :- copies whole resources directory and its sub directories.
cp -R app/*.html dist/ :- copies index.html file
cp -R app/fonts dist/ :- copies fonts directory and its files.
mkdir -p scripts :- creates scripts directory inside dist folder.
cp -R app/scripts/*.js dist/scripts/ :- copies all the .js files.
cp -R app/scripts/models dist/scripts/ :- copies models directory and its sub directories. 
cp -R app/scripts/templates dist/scripts/ :- copies templates directory and its sub directories.
cp -R app/scripts/views dist/scripts/ :-  copies views directory and its sub directories.
mkdir vendor :- create vendor directory inside dist/scripts folders.
mkdir animate.css :- creates animate.css folder inside dist/scripts/vendor folders. 
cp -R app/scripts/vendor/animate.css/animate.min.css dist/scripts/vendor/animate.css :- copies animate.min.css file.
cp -R app/scripts/vendor/bootstrap-datepicker/dist/js/bootstrap-datepicker.js dist/scripts/vendor/bootstrap-datepicker/dist/js/ :- copies bootstrap-datepicker.js file to its destination folder. 

cp -R app/scripts/vendor/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js dist/scripts/vendor/seiyria-bootstrap-slider/dist/ :- copies bootstrap-slider.min.js file to its destination folder.

cp -R app/scripts/vendor/bootstrap/dist/js/bootstrap.js dist/scripts/vendor/bootstrap/dist/js/ :- copies bootstrap.js file to its destination folder.

cp -R app/scripts/vendor/jquery/dist/*.js dist/scripts/vendor/jquery/dist/ :- copies jquery.js and jquery.min.js file to its destination folder.

cp -R app/scripts/vendor/parse/parse.js dist/scripts/vendor/parse/ :- copies parse.js file to its destination folder.

cp -R app/scripts/vendor/requirejs/require.js dist/scripts/vendor/requirejs/ :- copies require.js  file to its destination folder.

cp -R app/scripts/vendor/requirejs-text/text.js dist/scripts/vendor/requirejs-text/ :- copies text.js  file to its destination folder.

cp -R app/scripts/vendor/underscore/underscore.js dist/scripts/vendor/underscore/ :- copies underscore.js  file to its destination folder.

cp -R app/scripts/vendor/underscore/underscore-min.js dist/scripts/vendor/underscore/ :- copies underscore-min.js  file to its destination folder.

cp -R app/scripts/vendor/requirejs-plugins/src/async.js dist/scripts/vendor/requirejs-plugins/src/ :- copies async.js  file to its destination folder.
