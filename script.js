var i = 0;
var txt = "Lorem ipsum dummy text blabla.";
var speed = 50;

function typeWriter() {
  if (i < txt.length) {
    document.getElementById("demo").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}

//Video APP
document.addEventListener("mouseover", hoverVideo, false);
var appVideo = document.getElementsByClassName(".appVideo");
[].forEach.call(vid, function (item) {
  item.addEventListener("mouseover", hoverVideo, false);
  item.addEventListener("mouseout", hideVideo, false);
});

function hoverVideo(e) {
  this.play();
}
function hideVideo(e) {
  this.pause();
}

//Dark Mode

const darkbutton = document.getElementById("dark");
const body = document.body;
// Button Event Handlers

darkbutton.onclick = () => {
  body.classList.add("dark");
};

//Slide Feature

const tl = gsap.tomeline({ defaults: { ease: "power1.out" } });

// Animation

//import { loadAnimation } from 'lottie-web';
//import { defineLordIconElement } from 'lord-icon-element';

// register lottie and define custom element
//defineLordIconElement(loadAnimation);

/* let ScrumAnim = lottie.loadAnimation({
  container: document.getElementById('anim'), // the dom element that will contain the animation
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/Animations/1-il-meeting/1-il-meeting/Lottie Files/1-il-meeting-loop.json' // the path to the animation json
}); 

ScrumAnim.autoplay()*/

let ProgramingL = LottieInteractivity.create({
  mode: "scroll",
  player: "#Anim",
  actions: [
    {
      visibility: [0, 1],
      type: "seek",
      frames: [0, 300],
    },
  ],
});

ProgramingL();
