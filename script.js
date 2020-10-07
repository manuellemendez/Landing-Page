var i = 0;
var txt = 'Lorem ipsum dummy text blabla.';
var speed = 50;

function typeWriter() {
  if (i < txt.length) {
    document.getElementById("demo").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}





//Dark Mode

const darkbutton = document.getElementById('dark');
const body = document.body;
// Button Event Handlers

darkbutton.onclick = () => {
body.classList.add('dark');
};



//Slide Feature

const tl = gsap.tomeline({defaults:{ ease:"power1.out"}});



