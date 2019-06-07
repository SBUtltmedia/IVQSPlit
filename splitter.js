
const fs = require('fs');
const csv = require('csv-parser');
var TimeFormat = require('hh-mm-ss')
const { spawn } = require('child_process')
const process = require('process');
const videoNumber=process.argv[2];
var startingDir = process.argv[3];
var IVQFolders ="IVQFolders";
// var startTime = '00:02:20';
// var endTime = '00:06:13';

var fileName = `quiz${videoNumber}.json`
var csvName = `${videoNumber}.csv`
var index = 0;
var runFfmpeg=true;
fs.createReadStream(csvName)
    .pipe(csv())
    .on('data',
        (row) => {
          index++;
          makenewJson(row['Title/sub-title'], index, row['Video Start Time'],
                      row['Video End Time']);
        })
    .on('end', function() {
      // some final operation
    });

function toSeconds(atime) {
  return parseInt(atime.split(":")[0]) * 60 + parseInt(atime.split(":")[1])
}

function makenewJson(title, qid, startTime, endTime) {
    console.log(title, qid, startTime, endTime)
  fs.readFile(fileName, "utf8", function read(err, contents) {

    var startTimeSeconds = toSeconds(startTime)
    var endTimeSeconds = toSeconds(endTime)
    var myJson = JSON.parse(contents)
    var subJson = JSON.parse(contents)
    var questions = [];

    for (i = 0; i < myJson.questions.length; i++) {
      var currentQuestion = JSON.parse(JSON.stringify(myJson.questions[i]));
      var currentTime = currentQuestion.startTime
    //  console.log(currentTime, startTimeSeconds, endTimeSeconds)
      if (currentTime >= startTimeSeconds && currentTime <= endTimeSeconds) {

        currentQuestion.startTime = currentTime - startTimeSeconds
        questions.push(currentQuestion)
      }
    }
    var currentVideo = IVQFolders+"/"+(parseInt(startingDir) + qid);
    subJson.questions = questions
    subJson.title = title;
	var videoPath = `../meichan/${currentVideo}/media/`;
    subJson.videoPath = `${videoPath}video.mp4`;
    var JSONPath = `${currentVideo}/json`
    fs.mkdir(JSONPath, {recursive : true}, (err) => {
            console.log( JSONPath)
      if (err) {
        throw err;

      } else {
        fs.writeFile(`${JSONPath}/quiz.json`,
                     JSON.stringify(subJson, null, "\t"), function(err) {
                       if (err) {
                       }

                       console.log("The file was saved!");
                     })
      }
    });
	fs.mkdir(currentVideo+'/media', {recursive : true}, (err) => {
      if (err) {
        throw err;
      } else {
        if (runFfmpeg){
        const ffmpeg = spawn('ffmpeg', ['-i', `video${videoNumber}.mp4`,'-ss', `${startTimeSeconds}`, '-to', `${endTimeSeconds}`, `${currentVideo}/media/video.mp4`]);
        ffmpeg.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });

        ffmpeg.stderr.on('data', (data) => {
          console.log(`stderr: ${data}`);
        });

        ffmpeg.on('close', (code) => {
          console.log(`child process exited with code ${code}`);
        });
}
      //  const copyDir = spawn('cp', ["-a", "resources/*",currentVideo]);
        const copyDir = spawn('tar', ["-xvf","resources.tar","-C",currentVideo]);
        copyDir.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });

        copyDir.stderr.on('data', (data) => {
          console.log(`stderr: ${data}`);
        });

        copyDir.on('close', (code) => {
          console.log(`child process exited with code ${code}`);
        });

      }
    });
  })
}

//   .then(function(myJson) {
//
//     for (i = 0; i <myJson.questions.length;i++){
//
//     var currentTime = myJson.questions[i].startTime
//
// if (currentTime >= startTimeSeconds && currentTime <= endTimeSeconds){
// console.log(currentTime)
//   myJson.questions[i].startTime = currentTime - startTime
// }
//
//
//     }
//
//   console.log(myJson);
//
//   });
