// Shared variables
var db
var wallImg;
var wall;
var canvas;
var canvasIsClickable = false;
var newViewElements;

// Main Page Variables
var mainPage
var mainElements;

// New Route Page Variables
var form;
var warningLabel;
var newElements;
var focused = false;
var digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

// View Route Page Variables
var viewRoutePage;
var viewElements;

// ---------------------------------------------------------------------------
// Function to find all elements and add scroll event listeners
// ---------------------------------------------------------------------------

function init() {
  // Locate shared elements
  canvas = document.getElementById("canvas");
  wallImg = document.getElementById("wall-img");
  newViewElements = document.getElementsByClassName('new-view-element');

  // Locate main page elements
  mainPage = document.getElementById("main-page");
  mainElements = document.getElementsByClassName('main-element');

  // Locate new route page elements
  form = document.getElementById("route-form");
  warningLabel = document.getElementById("warning-label");
  newElements = document.getElementsByClassName('new-element');

  // Locate view route page newElements
  viewRoutePage = document.getElementById('view-route-page');
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
// Function for Canvas
// ---------------------------------------------------------------------------

// Set canvas size and create instance of Wall
function initCanvas() {
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientWidth * (1280/960);
  wall = new Wall(canvas, wallImg);
  wall.draw();

  canvas.addEventListener('click', function(event) {
    if (canvasIsClickable) {
      wall.update(event.pageX, event.pageY);
      wall.draw();
    }
  });
}

// ---------------------------------------------------------------------------
// Functions for Main page
// ---------------------------------------------------------------------------

// Gather routes from database for main page
function initMainPage() {
  db.collection("routes").orderBy("time").onSnapshot(function(snapshot) {
    snapshot.forEach( function(doc) {
      addMainPageHtmlRoute(
        doc.data().name,
        doc.data().setter,
        doc.data().angle,
        doc.data().grade);
    })
  });
}

// Hide elements not on main page
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

  canvasIsClickable = false;
}

// Add single route and description to list on main page
function addMainPageHtmlRoute(name, setter, angle, grade) {
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

  mainPage.insertBefore(div, mainPage.childNodes[0]);
  div.classList.add("route");

  // Setup click behavior to open view page
  div.setAttribute("onclick", "openViewPage('" + name + "')");
}

// ---------------------------------------------------------------------------
// Functions for New Route Page
// ---------------------------------------------------------------------------

// Setup interval safety and form submit
function initNewPage() {
  // Code for form submit
  form.onsubmit = function(e) {
    e.preventDefault();
    formSubmit();
  };

  setInterval(checkInputContinuous, 100);
}

// Hide elements not on new page
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

  // Clear previous holds off of canvas
  wall.clear();
  form.reset();
}

// gather safe user input to send to database
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

// Function to send user input to database
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

// Function to ensure all form elements are filled out
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

// Function to run multiple times per second to continuously format user input.
function checkInputContinuous() {
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

// Function to hide elements not on view page
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
  // Clear holds from wall
  wall.clear();

  // Add new holds to wall and get route info from database
  setupRoute(routeId);
  setupHolds(routeId);
}

// Function to get holds from database and draw them on the wall
function setupHolds(routeId) {
  db.collection("routes").where('name', '==', routeId)
  .get().then(function(snapshot) {
    snapshot.forEach(function(doc) {
      wall.setHolds(doc.data().holds)
      wall.draw();
    });
  });
}

// Function to get route info from the database and place it on the page
function setupRoute(routeId) {
  db.collection("routes").where('name', '==', routeId)
  .get().then(function(snapshot) {
    snapshot.forEach(function(doc) {
      addViewPageHtmlRoute(
      doc.data().name,
      doc.data().setter,
      doc.data().angle,
      doc.data().grade);
    });
  });
}

// Function to place route info in divs and organize it on the page.
function addViewPageHtmlRoute(name, setter, angle, grade) {
  viewRoutePage.innerHTML = "";
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

  viewRoutePage.appendChild(nameHeading);
  viewRoutePage.appendChild(setterHeading);
  viewRoutePage.appendChild(angleHeading);
  viewRoutePage.appendChild(gradeHeading);
}

// ---------------------------------------------------------------------------
// Add event listener to trigger setup functions upon page load
// ---------------------------------------------------------------------------

window.addEventListener("load", init, {passive: false});
