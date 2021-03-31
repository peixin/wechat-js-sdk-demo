#!/bin/bash

set -e

versionFile=version

if [ ! -f "$versionFile" ] ; then
    echo 0 > $versionFile
fi

version=$(expr $(cat $versionFile) + 1)

cp dist/main.js www/main-$version.js

sed "s|main\.js|main\-$version\.js|" src/index.html > www/index-$version.html

qshell qupload2 --rescan-local  --src-dir=www --bucket=www-dev
qshell cdnrefresh -i deploy/torefresh.txt

echo $version > version

echo "==========================="
echo New Version: $version
echo http://dev-test.liupei.xin/index-$version.html