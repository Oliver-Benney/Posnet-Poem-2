
    // More API functions here:
    // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

    // the link to your model provided by Teachable Machine export panel
    const URL = "https://teachablemachine.withgoogle.com/models/k3nU2wf2w/";
    let model, webcam, ctx, labelContainer, maxPredictions;

    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // Note: the pose library adds a tmPose object to your window (window.tmPose)
        model = await tmPose.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const size = 200;
        const flip = true; // whether to flip the webcam
        webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append/get elements to the DOM
        const canvas = document.getElementById("canvas");
        canvas.width = size; canvas.height = size;
        ctx = canvas.getContext("2d");
        labelContainer = document.getElementById("label-container");
        
        labelContainer.appendChild(document.createElement("div"));
        }


    async function loop(timestamp) {
        webcam.update(); // update the webcam frame
        await predict();
        window.requestAnimationFrame(loop);
    }

// to hold the last catagory recieve 
var lastCat = -1;
// to hold how many words wide
var rowLength =0;
// to hold how many lines high
var divNum =0;

    async function predict() {
        // Prediction #1: run input through posenet
        // estimatePose can take in an image, video or canvas html element
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
        // Prediction 2: run input through teachable machine classification model
        const prediction = await model.predict(posenetOutput);

//place holder for the top catagory 
var topCat = -1;

for (let i = 0; i < maxPredictions; i++) {
  // if this prediction is 100%
  if(prediction[i].probability.toFixed(2)==1){
    // set to catagory to its name 
    topCat =prediction[i].className;
  }

}   

// number of words wide 
let rowMax = 10;
console.log(topCat)
//if its not the same catagory as the and 
//is assigned (not -1)
if(topCat!=lastCat && topCat!==-1){

  // if row is max length 
  if (rowLength == rowMax){
    //add new div to labelContainer 
    labelContainer.appendChild(document.createElement("div"));
    //add 1 to divNum
    divNum++;
    // reset rowLength to 0
    rowLength=0;
  }

  // add the top catagory to the latest divs html
  labelContainer.childNodes[divNum].innerHTML += " " + topCat;
  // set lastCat to topCat
  lastCat = topCat;
  // add a place to rowLength
  rowLength++;



        }

        // finally draw the poses
        drawPose(pose);
    }

    function drawPose(pose) {
        if (webcam.canvas) {
            ctx.drawImage(webcam.canvas, 0, 0);
            // draw the keypoints and skeleton
            if (pose) {
                const minPartConfidence = 0.5;
                tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
                tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
            }
        }
    }
