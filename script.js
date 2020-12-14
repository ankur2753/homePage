//trying to code this one using the functional pradigm

const completed = "completed";
const incomplete = "!completed";

function getEle(id) {
    return document.getElementById(id);
}

function toggleclass(element, classname) {
    if (element.classList.contains(classname)) {
        element.classList.remove(classname)
    } else element.classList.add(classname)
}


// get time and formate its
function getCurrTime() {
    return new Date().toLocaleTimeString();
}

function formateTime(time) {
    let formatedTime = time.split(":", 2).map(element => {
        return element.padStart(2, 0)
    });
    return formatedTime[0] + " : " + formatedTime[1];
}

// LOCAL STORAGE STUFF FOR TODOS
function getFromLocal(key) {
    return localStorage.getItem(key)
}

// check local storage at the start to prevent errors if not present set

function checkLocal() {
    getFromLocal(completed) == null ? localStorage.setItem(completed, "completed Item #0") : null;
    getFromLocal(incomplete) == null ? localStorage.setItem(incomplete, "!completed Item #1") : null;
}


// get items and split it to make an array
function getTodos(key) {
    return localStorage.getItem(key).split(",")
}

// funtion to save todos to local storage
function setTodo(todoType, todoStr) {
    let str = `${todoStr} #${createID(todoType)}`;
    let arr = getTodos(todoType);
    arr.push(str);
    localStorage.setItem(todoType, arr.toString());
}
// to manage deletion and completion status we need id -->
// take the last elemnt in todo list and take it's id add one to create a new id

function createID(type) {
    return parseInt(getTodoID(getTodos(type)[getTodos(type).length - 1])) + 2;
}


// get todo id from existing todos
function getTodoID(todoStr) {
    return todoStr.substring(todoStr.indexOf("#") + 1, todoStr.length);
}


// from the array inject todos to html

function createDivForTodo(type, ID,todoStr) {
    let div = document.createElement("div");
    div.id = `${type}-#${ID}`;
    div.classList.add("todo-content");
    div.innerHTML=divContent(todoStr);
    if (type==completed) {
        div.style.textDecoration="line-through"
    }
    return div;
}

function divContent(todoStr) {
    return  `${todoStr.split("#")[0]}
            <div class="actions">
             <button class="btn" id="toggleCompleted" onclick="toggleCompletionStatus(this.parentElement.parentElement.id)">
                     <i class="far  fa-check-square"></i>
             </button>
             <button class="btn" id="done" onclick="deleteTodo(this.parentElement.parentElement.id)">
                <i class="fas fa-trash"></i>
             </button>
            </div>
            `;
}



function displayDiv(div) {
    getEle("todos").append(div);
}
// function for getting all the todos and then displaying it in the dom
function displayContent() {
    getTodos(incomplete).forEach(task => {
        if(task.length>0)
        displayDiv(
                createDivForTodo(incomplete, getTodoID(task), task)
        )
    });
    getTodos(completed).forEach(task => {
        if(task.length>0)
        displayDiv(
                createDivForTodo(completed, getTodoID(task), task)
        );
    });
    
}
function clearDivs() {
    getEle("todos").innerHTML="";
}
// for deleting todos ->  remove element from html and local storage
function deleteTodo(ID) {   
    getEle(ID).style.display="none";
    let [type,id]=ID.split("-");
    let newArr =getTodos(type).filter(task => !task.includes(id));
    localStorage.setItem(type,newArr.toString());
}
// for marking done -> add line-through and move to completed in local storage
function toggleCompletionStatus(ID) {
    let type=ID.split("-")[0],newType;
    if (type==completed) {
        newType=incomplete;
    } else {
        newType=completed;
    }
    deleteTodo(ID);
    setTodo(newType,getEle(ID).innerText);
    clearDivs();
    displayContent();
}


// update time evry minute 
setInterval(() => {
    getEle("time").innerText = formateTime(getCurrTime());
}, 1000);

// update date dynamically 
getEle("date").innerText = new Date().toLocaleDateString();

// for darkmode toggle class on click
getEle("toggleMode").addEventListener("click", () => {
    toggleclass(document.body, "dark");
    toggleclass(getEle("sun"), "active");
    toggleclass(getEle("moon"), "active");
});

// enable and disable nav bar on click
getEle("todo").addEventListener("click", () => {
    toggleclass(getEle("todo-bar"), "active");
});
getEle("closeTodo").addEventListener("click", () => {
    toggleclass(getEle("todo-bar"), "active");
});

getEle("addTodo").addEventListener("click", () => {
    let text = getEle("newTodo").value;
    if (text.length > 0) {
        setTodo(incomplete, text);
    }
    getEle("newTodo").value = "";
    clearDivs()
    displayContent();
});


checkLocal();
displayContent();