// Shared variables
var db
var background1;
var background2;
var topNavigation;
var canvas;
var wallImg;
var wall;
var newViewElements;

// Main Page Variables
var main
var mainElements;

// New Route Page Variables
var creationFormContainer;
var form;
var warningLabel;
var focused = false;
var digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
var newElements;
var canvasIsClickable = false;

// View Route Page Variables
var routeDetailContainer
var viewElements;

// ---------------------------------------------------------------------------
// Function to find all elements and add scroll event listeners
// ---------------------------------------------------------------------------

function init() {
  // Locate shared elements
  background1 = document.getElementById("background1");
  background2 = document.getElementById("background2");
  topNavigation = document.getElementById("top-navigation");
  canvas = document.getElementById("view-canvas");
  wallImg = document.getElementById("wall-img");
  newViewElements = document.getElementsByClassName('new-view-element');


  // Locate main page elements
  main = document.getElementById("main");
  mainElements = document.getElementsByClassName('main-element');

  // Locate new route page elements
  creationFormContainer = document.getElementById("creation-form-container");
  form = document.getElementById("route-form");
  warningLabel = document.getElementById("warning-label");
  newElements = document.getElementsByClassName('new-element');

  // Locate view route page newElements
  routeDetailContainer = document.getElementById('route-detail-container');
  viewElements = document.getElementsByClassName('view-element');

  initCanvas();

  // Make main page visible, hide others
  openMainPage();

  // Get firebase firestore (After openMainPage because it is too slow)
  db = firebase.firestore();

  // Initialize each page
  initMainPage();
  initNewPage();
}

// ---------------------------------------------------------------------------
// Functions for Main page
// ---------------------------------------------------------------------------

function initMainPage() {
  db.collection("routes").orderBy("time").onSnapshot(function(snapshot) {
    main.innerHTML = '<div class="bottom-space"></div>';
    snapshot.forEach( function(doc) {
      addHtmlRoute(
        doc.data().name,
        doc.data().setter,
        doc.data().angle,
        doc.data().grade);
    })
  });
}

function openMainPage() {
  for (element of mainElements) {
    element.style.display = 'block';
  }

  for (element of newElements) {
    element.style.display = 'none';
  }

  for (element of viewElements) {
    element.style.display = 'none';
  }

  for (element of newViewElements) {
    element.style.display = 'none';
  }

  background1.style.background = "#fff"
  background2.style.background = "#fff"
  canvasIsClickable = false;
}

function addHtmlRoute(name, setter, angle, grade) {
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

  div.appendChild(nameHeading);
  div.appendChild(setterHeading);
  div.appendChild(angleHeading);
  div.appendChild(gradeHeading);

  main.insertBefore(div, main.childNodes[0]);
  div.classList.add("route");
  div.setAttribute("onclick", "openViewPage('" + name + "')");
}

// ---------------------------------------------------------------------------
// Functions for New Route Page
// ---------------------------------------------------------------------------

function initNewPage() {
  // Code for form submit
  form.onsubmit = function(e) {
    e.preventDefault();
    formSubmit();
  };

  setInterval(inputSafety, 100);
}

function openNewPage() {
  for (element of mainElements) {
    element.style.display = 'none';
  }

  for (element of newElements) {
    element.style.display = 'block';
  }

  for (element of viewElements) {
    element.style.display = 'none';
  }

  for (element of newViewElements) {
    element.style.display = 'block';
  }

  canvasIsClickable = true;
  wall.clear();
  form.reset();
  background1.style.background = "#9bc995";
  background2.style.background = "#5171a5";
}

function initCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerWidth * (1280/960);
  wall = new Wall(canvas, wallImg);
  wall.draw();

  canvas.addEventListener('click', function(event) {
    if (canvasIsClickable) {
      wall.update(event.pageX, event.pageY);
      wall.draw();
    }
  });
}

function formSubmit(e) {
  var name = form.elements["name"].value;
  var setter = form.elements["setter"].value;
  var angle = form.elements["angle"].value;
  var grade = form.elements["grade"].value;

  var inputIsSafe = checkInput(name, setter, angle, grade);

  if (inputIsSafe === true) {
    writeRouteData(name, setter, angle, grade)
  } else {
    warningLabel.innerHTML = inputIsSafe;
  }
  // Return false to prevent the default form behavior
  return false;
}

function checkInput(name, setter, angle, grade) {
  if (name == "") {
    return "<br>⚠️ Enter Route Name ⚠️";
  }

  if (setter == "") {
    return "<br>⚠️ Enter Setter Name ⚠️";
  }

  if (angle == "") {
    return "<br>⚠️ Enter Angle Value ⚠️";
  }

  if (grade == "v" || grade == "") {
    return "<br>⚠️ Enter Route Grade ⚠️";
  }

  if (wall.holds.length < 2) {
    return "<br>⚠️ Select at Least 2 Holds ⚠️";
  }

  db.collection("routes").where('name', '==', name)
  .get().then(function(snapshot) {
    if (!snapshot.empty) {
      return "<br>⚠️ Name already used ⚠️"
    }
  });

  return true;
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
      openMainPage();
  })
  .catch(function(error) {
      document.write("Error submitting route: ", error);
  });
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

// ---------------------------------------------------------------------------
//Functions for view route page
// ---------------------------------------------------------------------------

function openViewPage(routeId) {
  for (element of mainElements) {
    element.style.display = 'none';
  }

  for (element of newElements) {
    element.style.display = 'none';
  }

  for (element of viewElements) {
    element.style.display = 'block';
  }

  for (element of newViewElements) {
    element.style.display = 'block';
  }

  canvasIsClickable = false;
  wall.clear();
  background1.style.background = "#9bc995";
  background2.style.background = "#5171a5";
  setupRoute(routeId);
  setupHolds(routeId);
}

function setupHolds(routeId) {
  db.collection("routes").where('name', '==', routeId)
  .get().then(function(snapshot) {
    snapshot.forEach(function(doc) {
      wall.setHolds(doc.data().holds)
      wall.draw();
    });
  });
}

function setupRoute(routeId) {
  db.collection("routes").where('name', '==', routeId)
  .get().then(function(snapshot) {
    snapshot.forEach(function(doc) {
      addHtmlInRoute(
      doc.data().name,
      doc.data().setter,
      doc.data().angle,
      doc.data().grade);
    });
  });
}

function addHtmlInRoute(name, setter, angle, grade) {
  routeDetailContainer.innerHTML = "";
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

  routeDetailContainer.appendChild(nameHeading);
  routeDetailContainer.appendChild(setterHeading);
  routeDetailContainer.appendChild(angleHeading);
  routeDetailContainer.appendChild(gradeHeading);
}

// ---------------------------------------------------------------------------
// Add event listener to trigger setup functions upon page load
// ---------------------------------------------------------------------------

window.addEventListener("load", init, {passive: false});
