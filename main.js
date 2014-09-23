var fs = require('fs');
var path = require('path');

var RE_DEFINE = /define\(/gm;
var RE_LAST_COMMA = /[,|;]$/gm;
var RE_MODULE = /define\("(.*)", ?\[/;
var RE_TEMPLATE = /^troopjs-requirejs\/template\!/;
var RE_HTML = /\.html$/;

function mkdirsSync(dirpath, mode) { 
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split(path.sep).forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            }
            else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true; 
}

fs.readFile('mass-import.min.js', {encoding: 'utf8'}, function (err, data) {
    if (err) {
        throw err;
    }
    // find index
    var arr = [];
    var m;
    while (m = RE_DEFINE.exec(data)) {
        arr.push(m.index);
    }

    var i = 0;
    var l = arr.length;
    var content;
    var pathname;
    var paths;
    var filename;
    for (i; i < l; i++) {

        // get file content
        if (arr[i + 1]) {
            content = data.substring(arr[i], arr[i + 1] -1);
        } else {
            content = data.substring(arr[i]);
        }

        // get file path name
        RE_MODULE.exec(content);
        pathname = RegExp.$1;

        if (RE_TEMPLATE.test(pathname)) {
            pathname = pathname.replace(RE_TEMPLATE, '');
        }

        paths = pathname.split('/');
        filename = paths.pop();
        paths = paths.join('/');
        mkdirsSync(paths);

        if (!RE_HTML.test(filename)) {
            filename += '.js';
        }

        // rewrite file
        fs.writeFile(paths + '/' + filename, content.replace(RE_LAST_COMMA, ''), function () {
            console.log(arguments);
        });
    }

});
