const video = document.querySelector('.camera')
const canvas = document.querySelector('#canvasFrame')
const img = document.querySelector('img')
let onBoarding
let token
function createOnBoarding() {
  const apiKey = '570c70d1693636fdc200713415ebc3973afbdf19'
  const apiURL = 'https://demo-api.incodesmile.com'
  onBoarding = OnBoarding.create({ apiKey, apiURL })
}
function getUserMedia() {
  navigator.getUserMedia =
    navigator.mediaDevices.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  const constraints = {
    video: {
      facingMode: 'environment',
      width: {
        ideal: 1280,
      },
      height: {
        ideal: 1024,
      },
    },
  }
  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    setVideoSource(stream)
    startDetectID()
  })
}
function setVideoSource(stream) {
  if (window.HTMLMediaElement.srcObject) {
    window.HTMLMediaElement.srcObject(stream)
  } else {
    video.srcObject = stream
  }
  video.src = stream
}
function startDetectID() {
  //first create a session and save the token
  createSession().then(() => {
    detectFrontID()
  })
}
function createSession() {
  // get the token and save it as a global variable
  return onBoarding.createSession('MX').then(onBoardingToken => {
    token = onBoardingToken
  })
}
async function detectFrontID() {
  // call detect from our SDK to auto detect the image
  await onBoarding.warmup();
  onBoarding.detect({
    canvas,
    type: onBoarding.frontType,
    webcam: { video },
    onFarAway: () => showNotification('Move closer'),
    onCapturing: () => showNotification('hold still, capturing'),
    onCapture: handleFrontIdCapture,
    onIDNotDetected: () => showNotification('ID not detected'),
    onNothingHappen: () => showNotification('move to another place'),
  })
}
function handleFrontIdCapture(base64Image) {
  img.src = `data:image/png;base64,${base64Image}`
  showNotification('take capture', true)
  // send the image to our sdk
  onBoarding
    .capture({
      token,
      image: base64Image,
      type: 'front',
    })
    .then(alert)
    .catch(response => {
      // if something gone wrong you should call detect again
      alert(response)
      showNotification('Something went wrong', true)
      detectFrontID()
    })
}
function showNotification(text, isPriority = false) {
  // I am using Swal for notifications, you can use whatever you want
  if (!Swal.isVisible() || isPriority) {
    Swal.fire({
      html: text,
      timer: 3000,
      showConfirmButton: false,
    })
  }
}
document.addEventListener('DOMContentLoaded', () => {
  createOnBoarding()
  getUserMedia()
})