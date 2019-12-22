window.addEventListener("load", function() {onLoad();}, false);

var topNav;
var canvas;
var img;
var inroute;
var form;
var lowDiv;
var wall;
var warningLabel;
var focused = false;
var digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
var db

function onLoad() {
  //Locate HTML elements
  db = firebase.firestore();
  topNav = document.getElementById("topnav");
  canvas = document.getElementById("viewcanvas");
  img = document.getElementById("img");
  inroute = document.getElementById("inroute");
  form = document.getElementById("routeform");
  lowDiv = document.getElementById("bottom");
  warningLabel = document.getElementById("warningLabel");

  canvas.width = window.innerWidth;
  canvas.height = window.innerWidth * (1280/960);
  wall = new Wall(canvas, img);
  wall.draw();

  canvas.addEventListener('click', function(event) {
    wall.update(event.pageX, event.pageY);
    wall.draw();
  });

  // Code for form submit
  form.onsubmit = function(e) {
    e.preventDefault();
    formSubmit();
  };

  bottomSetup();

  setInterval(inputSafety, 100);
}

function formSubmit(e) {
  var name = form.elements["name"].value;
  var setter = form.elements["setter"].value;
  var angle = form.elements["angle"].value;
  var grade = form.elements["grade"].value;

  if (name == "") {
    warningLabel.innerHTML = "<br>⚠️ Enter Route Name ⚠️";
    return false;
  }

  if (setter == "") {
    warningLabel.innerHTML = "<br>⚠️ Enter Setter Name ⚠️";
    return false;
  }

  if (angle == "") {
    warningLabel.innerHTML = "<br>⚠️ Enter Angle Value ⚠️";
    return false;
  }

  if (grade == "v" || grade == "") {
    warningLabel.innerHTML = "<br>⚠️ Enter Route Grade ⚠️";
    return false;
  }

  if (wall.holds.length < 2) {
    warningLabel.innerHTML = "<br>⚠️ Select at Least 2 Holds ⚠️";
    return false;
  }

  db.collection("routes").where('name', '==', name)
  .get().then(function(snapshot) {
    if (snapshot.empty)
    {
      writeRouteData(name, setter, angle, grade);
    }
    else {
      warningLabel.innerHTML = "<br>⚠️ Name already used ⚠️";
    }
  });
  // Return false to prevent the default form behavior
  return false;
}

function bottomSetup() {
// Code for bottom spacefiller div
  if (window.innerHeight > canvas.height + topNav.offsetHeight){
    lowDiv.style.height = (window.innerHeight -
    (inroute.offsetTop + 707)) + 3 + "px";
  } else {
    lowDiv.style.height = "0px";
  }
}

function writeRouteData(name, setter, angle, grade) {
  db.collection("routes").add({
    name: name,
    setter: setter,
    angle: angle,
    grade: grade,
    time: firebase.firestore.Timestamp.now(),
    holds: wall.getHolds()
  })
  .then(function(docRef) {
      openIndex();
  })
  .catch(function(error) {
      document.write("Error submitting route: ", error);
  });
}

// Return to the main page.
function openIndex() {
  location.href='index.html';
}

function inputSafety() {
  if (focused && form.elements["grade"].value.length == 0) {
    form.elements["grade"].value = "v";
  } else if (focused == false && form.elements["grade"].value == "v") {
    form.elements["grade"].value = "";
  }

  if (focused && form.elements["grade"].value[0] != "v") {
    form.elements["grade"].value = "v" + form.elements["grade"].value[0];
  }

  if (form.elements["grade"].value.length > 1 &&
      !digits.includes(form.elements["grade"].value[form.elements["grade"].value.length - 1])) {
    form.elements["grade"].value = form.elements["grade"].value.substring(0, form.elements["grade"].value.length - 1);
  }
}
