//window.addEventListener('resize', function(event){setup()});
window.addEventListener("load", function() {setup()}, false);

var db, content;

// Custom Scrolling variables
var prevY = 0;
var ySpeed = 0;
var scrolling = false;

function setup() {
  db = firebase.firestore();
  content = document.getElementById("content");
  getRouteData();

  // Create custom momentum scrolling
  content.addEventListener('touchmove', function (event) {
    if (scrolling)
    {
      scrolling = false;
      prevY = 0;
    }

    if (prevY != 0) {
      ySpeed = (prevY - event.touches[0].screenY);
    }

    prevY = event.touches[0].screenY;

    content.scrollBy(0, ySpeed);

    event.preventDefault();
  }, {passive: false});

  content.addEventListener('touchend', function (event) {
    scrolling = true;
    repeatScroll();
  });
}

function repeatScroll()
{
  if (Math.abs(ySpeed) <= 0.5 || !scrolling)
  {
    prevY = 0;
    ySpeed = 0;
    scrolling = false;
    return;
  }

  content.scrollBy(0, ySpeed);
  ySpeed *= 0.95;
  setTimeout(repeatScroll, 10);
}

function getRouteData() {
  db.collection("routes").orderBy("time").onSnapshot(function(snapshot) {
    content.innerHTML = '<div class="bottomspace"></div>';
    snapshot.forEach( function(doc) {
      addHTMLRoute(
        doc.data().name,
        doc.data().setter,
        doc.data().angle,
        doc.data().grade);
    })
  });
}

function addHTMLRoute(name, setter, angle, grade) {
  var div = document.createElement("div");
  var nameHeading = document.createElement("h3");
  var setterHeading = document.createElement("h4");
  var angleHeading = document.createElement("h4");
  var gradeHeading = document.createElement("h4");

  var nameText = document.createTextNode(name);
  var setterText = document.createTextNode("Setter: " + setter);
  var angleText = document.createTextNode("Angle: " + angle + "°");
  if (grade == 'v99')
  {
    var gradeText = document.createTextNode("Unsent");
  }
  else
  {
    var gradeText = document.createTextNode("Grade: " + grade);
  }

  nameHeading.appendChild(nameText);
  setterHeading.appendChild(setterText);
  angleHeading.appendChild(angleText);
  gradeHeading.appendChild(gradeText);

  div.appendChild(nameHeading);
  div.appendChild(setterHeading);
  div.appendChild(angleHeading);
  div.appendChild(gradeHeading);

  content.insertBefore(div, content.childNodes[0]);
  div.classList.add("route");
  div.setAttribute("onclick", "openRoute('" + encodeURIComponent(name) + "')");
}

function openRoute(i) {
  location.href='viewroute.html#' + i;
}

function openNew() {
  location.href='newroute.html';
}
