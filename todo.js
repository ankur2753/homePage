
var db;
export var objStores = ["Todos", "Ideas", "checklist", "cravings"];
export var currentObjStore = objStores[0];
var objectType = {
  autoIncrement: true,
  keyPath: "id",
};

// check local storage at the start to prevent errors if not present set

function openTransaction(objectStore) {
  return db.transaction(objectStore, "readwrite").objectStore(objectStore);
}

// get items and split it to make an array
export function getPage(objectStore) {
  let objStore = openTransaction(objectStore);
  let request = objStore.openCursor();
  request.onsuccess = (e) => {
    let cursor = e.target.result;
    if (cursor) {
      let { completed, name } = cursor.value;
      displayDiv(
        createDivForTodo(completed, name, `${cursor.source.name} ${cursor.key}`)
      );
      cursor.continue();
    }
  };
  request.onerror = (err) => console.error(`error +${err}`);
}

// funtion to save todos to local storage
export function setItem(objectStore, todoStr) {
  let objStore = openTransaction(objectStore);
  let req = objStore.add({
    completed: false,
    name: todoStr,
  });
  req.onsuccess = (e) => console.log;
  req.onerror = (e) => console.log;
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
    div.classList.add("done");
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
               &#9249
               </button>
              </div>
              `;
}

function displayDiv(div) {
  getEle("todos").appendChild(div);
}

// function for getting all the todos and then displaying it in the dom

export function clearDivs() {
  getEle("todos").innerHTML = "";
}

// for deleting todos ->  remove element from html and local storage
function deleteTodo(id) {
  let key = parseInt(id.split(" ")[1]);
  let objStore = openTransaction(currentObjStore);
  let request = objStore.delete(key);
  request.onsuccess = (e) => {
    // getEle(id).parentNode.removeChild(getEle(id));
    clearDivs();
    getPage(currentObjStore);
  };
  request.onerror = (err) => console.error;
}

// for marking done -> add line-through and move to completed in local storage
function toggleCompletionStatus(id) {
  let key = parseInt(id.split(" ")[1]);
  let objStore = openTransaction(currentObjStore);
  let request = objStore.get(key);
  request.onsuccess = (e) => {
    var value = e.target.result;
    value.completed = !value.completed;
    objStore.put(value);
    toggleclass(getEle(id), "done");
    toggleclass(getEle(id).querySelector("i"), "far");
    toggleclass(getEle(id).querySelector("i"), "fas");
  };
  request.onerror = (err) => console.error;
}

createDB("Storage", ...objStores);

// indexDB stuff
async function createDB(name, ...objectStores) {
  let request = indexedDB.open(name);
  request.onsuccess = () => {
    db = request.result;
    if (objectStores.length > 0) {
      // open a new version to start the on upgrade needed function
      let currVersion = db.version;
      request = indexedDB.open(name, ++currVersion);
    }
  };
  request.onerror = (err) => console.error;
  request.onupgradeneeded = async (e) => {
    db = await e.target.result;
    // for the first time add todos automatically
    console.log("old verison was " + e.oldVersion);
    if (e.oldVersion < 1) {
      objectStores.forEach((objStore) => {
        db.createObjectStore(objStore, objectType).add({
          completed: false,
          name: `this is an example of ${objStore}`,
        });
      });
    }
  };
}

function addObjStore(objStore) {
  db.close();
  createDB("Storage", objStore);
}
