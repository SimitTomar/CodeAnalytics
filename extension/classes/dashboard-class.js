const fs = require("fs");

class Dashboard {
    generateHtml() {
        let fileData = {};
        let currentFileTime = 0;
        let lastFileTime = 0;
        let timeTakenByEachFile = 0;
        fs
            .createReadStream('/Users/simtomar/Desktop/My_Projects/CodeAnalytics/data/activity.log')
            .on('error', function (error) {
            console.log('Error:', error.message);
        })
            .pipe(es.split())
            .pipe(es.map(function (line, cb) {
            let lineData = JSON.parse(line);
            lastFileTime = currentFileTime; //0,0,2,8,10
            currentFileTime = lineData['totalUsedTime']; //0,2,8,10,20
            if (fileData.hasOwnProperty(lineData['fileName'])) {
                timeTakenByEachFile = (currentFileTime - lastFileTime) + fileData[lineData['fileName']]; //2,8,18
                fileData[lineData['fileName']] = timeTakenByEachFile; //2,8,18
            }
            else {
                timeTakenByEachFile = currentFileTime - lastFileTime; //0,2
                fileData[lineData['fileName']] = timeTakenByEachFile; //0,2
            }
            console.log('fileData', fileData);
            cb(null, line);
        }));
    }
}


module.exports = Dashboard;