const urlParams = new URLSearchParams(window.location.search);

const button = document.getElementById("button");
const input = document.getElementById("input");
const settings = document.getElementById("settings");
const menuBG = document.getElementById("menuBG");
const theme = document.getElementById("theme");
const sliderIcon = document.getElementById("sliderIcon");
const settingsMenu = document.getElementById("settingsMenu");

var ws = input.innerHTML;
var menu = false;

if (urlParams.get('t') == "d") {
  themeVal = "d";
  document.body.style.backgroundColor = "#303033";
  menuBG.style.backgroundColor = "#303035";
  theme.style.filter = "invert(0.6)";
  theme.src = "hellesonne.png";
  settings.style.filter = "invert(0.6)";
  sliderIcon.style.filter = "invert(0.6)";
}
else {
  themeVal = "l";
  document.body.style.backgroundColor = "#FFFFFF";
  menuBG.style.backgroundColor = "#909093";
  theme.style.filter = "invert(0)";
  theme.src = "mond.png";
  settings.style.filter = "invert(0)";
  sliderIcon.style.filter = "invert(0)";
};

button.addEventListener('click', function(event) {
  var ws = input.value;
  console.log(ws);
  if (ws != "") {
    window.location.href = `${window.location.href}main.html?ws=${ws}&t=${themeVal}`;
  }
});

settings.addEventListener('click', function(event) {
  menu = !menu;
  if (menu) {
    settingsMenu.style.visibility = "visible";
    menuBG.style.visibility = "visible";
  }
  else {
    menuBG.style.visibility = "hidden";
    settingsMenu.style.visibility = "hidden";
  };
});

theme.addEventListener('click', function(event) {
  console.log("click");
  var newParams;
  if (themeVal != "d") {
    console.log("d");
    themeVal = "dark";
    document.body.style.backgroundColor = "#303033";
    menuBG.style.backgroundColor = "#303035";
    theme.style.filter = "invert(0.6)";
    theme.src = "hellesonne.png";
    settings.style.filter = "invert(0.6)";
    sliderIcon.style.filter = "invert(0.6)";
    newParams = "t=d"
  }
  else {
    console.log("l");
    themeVal = "l";
    document.body.style.backgroundColor = "#FFFFFF";
    menuBG.style.backgroundColor = "#909093";
    theme.style.filter = "invert(0)";
    theme.src = "mond.png";
    settings.style.filter = "invert(0)";
    sliderIcon.style.filter = "invert(0)";
    newParams = "t=l"
  };
  window.history.replaceState({}, "", "?" + newParams);
});
