cd ~/GitHub/boat-day-hosts

DVPT="app"
DIST="parse/public"
CLOUD="../boat-day-cloud"

if [ -d $DIST ]
then
    rm -rf $DIST
    mkdir $DIST
else
    mkdir $DIST
fi

lessc $DVPT/css/less/styles.less > $DVPT/css/boatday.css

mkdir -p $DIST/css
cp -R $DVPT/css/*.css $DIST/css

cp -R $DVPT/fonts $DIST/
cp -R $DVPT/resources $DIST/
cp -R $DVPT/*.html $DIST/

mkdir -p $DIST/scripts
cp -R $DVPT/scripts/models $DIST/scripts/
cp -R $DVPT/scripts/templates $DIST/scripts/
cp -R $DVPT/scripts/views $DIST/scripts/
cp -R $DVPT/scripts/*.js $DIST/scripts/

mkdir -p $DIST/scripts/vendor/animate.css/
cp -R $DVPT/scripts/vendor/animate.css/animate.min.css $DIST/scripts/vendor/animate.css

mkdir -p $DIST/scripts/vendor/bootstrap-datepicker/dist/js/
cp -R $DVPT/scripts/vendor/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.* $DIST/scripts/vendor/bootstrap-datepicker/dist/js/

mkdir -p $DIST/scripts/vendor/bootstrap/dist/js/
cp -R $DVPT/scripts/vendor/bootstrap/dist/js/bootstrap.min.* $DIST/scripts/vendor/bootstrap/dist/js/

mkdir -p $DIST/scripts/vendor/bootstrap/dist/fonts/
cp -R $DVPT/scripts/vendor/bootstrap/dist/fonts/* $DIST/scripts/vendor/bootstrap/dist/fonts/

mkdir -p $DIST/scripts/vendor/seiyria-bootstrap-slider/dist/
cp -R $DVPT/scripts/vendor/seiyria-bootstrap-slider/dist/bootstrap-slider.min.* $DIST/scripts/vendor/seiyria-bootstrap-slider/dist/

mkdir -p $DIST/scripts/vendor/jquery/dist/
cp -R $DVPT/scripts/vendor/jquery/dist/jquery.min.* $DIST/scripts/vendor/jquery/dist/

mkdir -p $DIST/scripts/vendor/parse/
cp -R $DVPT/scripts/vendor/parse/parse.min.* $DIST/scripts/vendor/parse/

mkdir -p $DIST/scripts/vendor/requirejs/
cp -R $DVPT/scripts/vendor/requirejs/require.js $DIST/scripts/vendor/requirejs/

mkdir -p $DIST/scripts/vendor/requirejs-text/
cp -R $DVPT/scripts/vendor/requirejs-text/text.js $DIST/scripts/vendor/requirejs-text/

mkdir -p $DIST/scripts/vendor/underscore/
cp -R $DVPT/scripts/vendor/underscore/underscore-min.* $DIST/scripts/vendor/underscore/

mkdir -p $DIST/scripts/vendor/requirejs-plugins/src/
cp -R $DVPT/scripts/vendor/requirejs-plugins/src/async.js $DIST/scripts/vendor/requirejs-plugins/src/

sed -i "" "s/globalDebug: true/globalDebug: false/g" $DIST/scripts/views/BaseView.js
sed -i "" "s|urlArgs|//urlArgs|g" $DIST/scripts/main.js
sed -i "" "s|LCn0EYL8lHOZOtAksGSdXMiHI08jHqgNOC5J0tmU|8YpQsh2LwXpCgkmTIIncFSFALHmeaotGVDTBqyUv|g" $DIST/scripts/main.js
sed -i "" "s|kXeZHxlhpWhnRdtg7F0Cdc6kvuGHVtDlnSZjfxpU|FaULY8BIForvAYZwVwqX4IAmfsyxckikiZ2NFuEp|g" $DIST/scripts/main.js

cd parse
parse deploy "BoatDay-v2-HP"
