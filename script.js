//trying to code this one using the functional pradigm
var db;
var currentObjStore = "Todos"
var objectType = {
    autoIncrement: true,
    keyPath: "id"
};
var exampleObj = {
    completed: false,
    name: "this is an example "
};

function getEle(id) {
    return document.getElementById(id);
}

function toggleclass(element, classname) {
    if (element.classList.contains(classname)) {
        element.classList.remove(classname)
    } else element.classList.add(classname)
}


// get time and formate its
function getCurrTime(dateObject) {
    return dateObject.toLocaleTimeString();
}

function formateTime(time) {
    let formatedTime = time.split(":")
        .map(element => {
            return element.padStart(2, 0)
        });
    return formatedTime[0] + " : " + formatedTime[1];
}

function getSeconds(dateObj) {
    return dateObj.toLocaleString().split(":")[2].split(" ")[0];
}

function updateDateTime(dateObj) {
    getEle("time").innerText = formateTime(getCurrTime(dateObj));
    getEle("seconds").innerText = " :" + getSeconds(dateObj);
    getEle("date").innerText = `${[dateObj.getDate(),dateObj.getMonth()+1,dateObj.getFullYear()].join("/")}`;
}
// display date time on page load
updateDateTime(new Date());

// update date&time evry minute 
setInterval(() => {
    let date = new Date();
    updateDateTime(date);
}, 1000);

// for darkmode toggle class on click
getEle("toggleMode").addEventListener("click", () => {
    toggleclass(document.body, "dark");
    toggleclass(getEle("sun"), "active");
    toggleclass(getEle("moon"), "active");
});

// ******************//
// THIS STUFF SHOULD BE IN A DIFFRENT PAGE BUT IF LOADING LOCAL HTMLS MODULES ARE'NT ALLOWED SO IT'LL STAY HERE UNTIL A WORKAROUND IS FOUND

// LOCAL STORAGE STUFF FOR TODOS


// check local storage at the start to prevent errors if not present set


function openTransaction(objectStore) {
    return db.transaction(objectStore, "readwrite").objectStore(objectStore);
}

// get items and split it to make an array
function getPage(objectStore) {
    let objStore = openTransaction(objectStore);
    let request = objStore.openCursor();
    request.onsuccess = e => {
        let cursor = e.target.result;
        if (cursor) {
            let {
                completed,
                name
            } = cursor.value;
            displayDiv(createDivForTodo(completed, name, `${cursor.source.name} ${cursor.key}`));
            cursor.continue();

        }

    }
    request.onerror = err => console.error(`error +${err}`);
}

// funtion to save todos to local storage
function setItem(objectStore, todoStr) {
    let objStore = openTransaction(objectStore);
    let req = objStore.add({
        completed: false,
        name: todoStr
    });
    req.onsuccess = e => console.log;
    req.onerror = e => console.log;
}

// to manage deletion and completion status we need id -->

// take the last elemnt in todo list and take it's id add 2 to create a new id



// from the array inject todos to html

function createDivForTodo(completion, todoStr, id) {
    let div = document.createElement("div");
    div.classList.add("todo-content");
    div.id = id;
    div.innerHTML = divContent(todoStr);
    if (completion) {
        div.classList.add("done")
    }
    return div;
}

function divContent(todoStr) {
    return `${todoStr}
            <div class="actions">
             <button class="btn"  onclick="toggleCompletionStatus(this.parentElement.parentElement.id)">
                    <i class="far  fa-check-square"></i>
             </button>
             <button class="btn"  onclick="deleteTodo(this.parentElement.parentElement.id)">
               <i class="fas fa-trash"></i>
             </button>
            </div>
            `;
}



function displayDiv(div) {
    getEle("todos").appendChild(div);
}

// function for getting all the todos and then displaying it in the dom


function clearDivs() {
    getEle("todos").innerHTML = "";
}

// for deleting todos ->  remove element from html and local storage
function deleteTodo(id) {
    let key = parseInt(id.split(" ")[1]);
    let objStore = openTransaction(currentObjStore);
    let request = objStore.delete(key);
    request.onsuccess = e => {
        getEle(id).parentNode.removeChild(getEle(id));
    }
    request.onerror = err => console.error;
}

// for marking done -> add line-through and move to completed in local storage
function toggleCompletionStatus(id) {

    let key = parseInt(id.split(" ")[1]);
    let objStore = openTransaction(currentObjStore);
    let request = objStore.get(key);
    request.onsuccess = e => {
        var value = e.target.result;
        value.completed = !value.completed;
        objStore.put(value);
        toggleclass(getEle(id), "done");
        toggleclass(getEle(id).querySelector("i"), "far");
        toggleclass(getEle(id).querySelector("i"), "fas");
    }
    request.onerror = err => console.error;

}

// ***********************************************//


// enable and disable nav bar on click
getEle("todo").addEventListener("click", () => {
    toggleclass(getEle("todo-bar"), "active");
    clearDivs();
    getPage(currentObjStore)
});
getEle("closeTodo").addEventListener("click", () => {
    toggleclass(getEle("todo-bar"), "active");
});

getEle("addTodo").addEventListener("click", () => {
    try {
        let text = getEle("newTodo").value;
        if (text.length > 0) {
            setItem(currentObjStore, text);
            getPage(currentObjStore);
        }
        getEle("newTodo").value = '';
    } catch (error) {
        alert(`opps something went wrong  ${error}`)
    }

});


createDB("Storage", "idea");
// indexDB stuff
async function createDB(name, ...objectStores) {

    let request = indexedDB.open(name);
    request.onsuccess = () => {
        db = request.result;
        if (objectStores.length > 0) {
            // open a new version to start the on upgrade needed function
            request = indexedDB.open(name, ++request.result.version);
        }
    }
    request.onerror = err => console.error;
    request.onupgradeneeded = async (e) => {
        db = await e.target.result;
        // for the first time add todos automatically
        console.log("old verison was" + e.oldVersion);
        if (e.oldVersion < 1) {
            db.createObjectStore(currentObjStore, objectType).add(exampleObj);
        }
        objectStores.forEach(objStore => {
            db.createObjectStore(objStore, {
                autoIncrement: true,
                keyPath: "id"
            }).add({
                completed: false,
                name: "this is an example "
            });
        })
    }
}


function addObjStore(objStore) {
    db.close();
    createDB("Storage", objStore);
}