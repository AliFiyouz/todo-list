// let  saturday = document.querySelector(".saturday");
// let input = document.createElement("input");
// let check = document.createElement("input");
// let set = check.setAtterbiut("type","check-box");
// saturday.appendChild(check);
// saturday.appendChild(input);
let week = document.querySelector(".week");
let MainDiv = document.createElement("div");
input = document.createElement("input")
input.setAttribute("type" , "text");
input.setAttribute("id" , "name");
input.setAttribute("placeholder", " Set Your items . . . ");
week.appendChild(MainDiv);
MainDiv.appendChild(input);

let paragraf = document.createElement("p");
paragraf.setAttribute("id" , "p");
week.appendChild(paragraf);

let submit = document.createElement("input");
submit.setAttribute("value" , "Submit!")
submit.setAttribute("type" , "submit");
submit.setAttribute("id" , "submit");
MainDiv.appendChild(submit); 

document.addEventListener("click" , "submitItem")

function submitItem(params) {
    let item = document.getElementById("name").value;
    document.getElementById("p").innerHTML = item
}
let submittedN// add event listener to submit name
document.querySelector("#form").addEventListener("submit", submitName);
// add variable to get submitted nameame;
//add event listener to get name change
document.querySelector("#name").addEventListener("change", user);
// Get submitted name when name input changes
function user(event) {
  console.log(event.target.value);
  submittedName = event.target.value;
  localStorage.setItem("name", submittedName);
}
// when form is submitted change display
function submitName(e) {
  e.preventDefault();
  document.getElementById("formContainer").style.display = "none";
  document.querySelector(".container1").style.display = "flex";}