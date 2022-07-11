let InsertForm = document.querySelector("#form");
let noteList = document.querySelector("#note-list");


// Event Lisetener
InsertForm.addEventListener("submit" , newNote);



// adding Event Listener to the list 
function newNote(e){
    //to do nothing when submit clicked
    e.preventDefault();
    let noteValue = document.querySelector("#note").value;
    //creat li 
    let newLi = document.createElement("li");
    noteList.appendChild(newLi);
    // change content to text mode
    newLi.appendChild(document.createTextNode(noteValue));
    
    // creat remove btn
    const removeBtn = document.createElement("span");
    // content removeBtn = x
    removeBtn.textContent = "X";
    //add a class list for removebtn
    removeBtn.classList.add("remove-btn");
    // appendChild
    newLi.appendChild(removeBtn);
    console.log(newLi);
}

function saveNoteLocalStorage(){
    let fruits = ["apple" , "banana"];
}
let x = [01, 02, "ali", "proPlayer"];

localStorage.setItem("item" , JSON.stringify(x))



console.log(JSON.parse(localStorage.getItem("item")));



let person = {name:'John', age:31, city:"New York"};

person.name = "Gilbert";