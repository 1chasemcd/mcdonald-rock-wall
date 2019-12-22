window.addEventListener("load", function() {setup();}, false);

var wall;
var topNav;
var canvas;
var img;
var bottom;
var routeId;
var db;

function setup() {
  //Locate HTML elements
  db = firebase.firestore();
  topNav = document.getElementById("topnav");
  canvas = document.getElementById("viewcanvas");
  img = document.getElementById("img");
  bottom = document.getElementById("bottom");
  routeId = decodeURIComponent(location.hash.substr(1));

  setupRoute(routeId);

  // Setup canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerWidth * (1280/960);
  wall = new Wall(canvas, img);
  setupHolds(routeId);

  bottomSetup();
}

function bottomSetup() {
  // Code for bottom spacefiller div
  if (window.innerHeight > canvas.height + topNav.offsetHeight){
    bottom.style.height = (window.innerHeight -
    (inroute.offsetTop + 334)) + 3 + "px";
  } else {
    bottom.style.height = "0px";
  }
}

function setupHolds(name) {
  db.collection("routes").where('name', '==', name)
  .get().then(function(snapshot) {
    snapshot.forEach(function(doc) {
      wall.setHolds(doc.data().holds)
      wall.draw();
    });
  });
}

function setupRoute(name) {
  db.collection("routes").where('name', '==', name)
  .get().then(function(snapshot) {
    snapshot.forEach(function(doc) {
      addHTMLInRoute(
      doc.data().name,
      doc.data().setter,
      doc.data().angle,
      doc.data().grade);
    });
  });
}

function addHTMLInRoute(name, setter, angle, grade) {
  inroute.innerHTML = "";
  var div = document.createElement("div");
  var nameHeading = document.createElement("h3");
  var setterHeading = document.createElement("h4");
  var angleHeading = document.createElement("h4");
  var gradeHeading = document.createElement("h4");

  var nameText = document.createTextNode(name);
  var setterText = document.createTextNode("Setter: " + setter);
  var angleText = document.createTextNode("Angle: " + angle + "°");
  var gradeText = document.createTextNode("Grade: " + grade);

  nameHeading.appendChild(nameText);
  setterHeading.appendChild(setterText);
  angleHeading.appendChild(angleText);
  gradeHeading.appendChild(gradeText);

  inroute.appendChild(nameHeading);
  inroute.appendChild(setterHeading);
  inroute.appendChild(angleHeading);
  inroute.appendChild(gradeHeading);
}

// Return to the main page.
function openIndex() {
  location.href='index.html';
}
