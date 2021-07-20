
var db;
var objStores = ["Todos", "Ideas", "checklist", "cravings"];
var objectType = {
  autoIncrement: true,
  keyPath: "id",
};
function requestErr(err){
  console.error(`error in request is : +${err}`);
}
// check local storage at the start to prevent errors if not present set

function openTransaction(objectStore) {
  return db.transaction(objectStore, "readwrite").objectStore(objectStore);
}

// get items and split it to make an array
function getPage(objectStore) {
  let res =[];
  let objStore = openTransaction(objectStore);
  let request = objStore.openCursor();
  request.onsuccess = (e) => {
    let cursor = e.target.result;
    if (cursor) {
      let { completed, name } = cursor.value;
      let id = `${cursor.source.name} ${cursor.key}`
      res.push({completed,name,id})
// function for getting all the todos and then displaying it in the dom
      displayDiv(createDivForTodo(completed,name,id))
      cursor.continue();
    }
  };
  request.onerror = requestErr; 
  return res;
}

// funtion to save todos to local storage
function setItem(objectStore, todoStr) {
  let objStore = openTransaction(objectStore);
  let req = objStore.add({
    completed: false,
    name: todoStr,
  });
  req.onsuccess = (e) => console.log;
  req.onerror = requestErr; 
}

// to manage deletion and completion status we need id -->

// take the last elemnt in todo list and take it's id add 2 to create a new id

// from the array inject todos to html




// for deleting todos ->  remove element from html and local storage
function deleteTodo(id,objectStore) {
  let key = parseInt(id.split(" ")[1]);
  let objStore = openTransaction(objectStore);
  let request = objStore.delete(key);
  request.onerror = requestErr; 
  return true;
}

// for marking done -> add line-through and move to completed in local storage
function toggleCompletionStatus(id,objectStore) {
  let key = parseInt(id.split(" ")[1]);
  let objStore = openTransaction(objectStore);
  let request = objStore.get(key);
  request.onsuccess = (e) => {
    var value = e.target.result;
    value.completed = !value.completed;
    objStore.put(value);
  };
  request.onerror = requestErr; 
}

createDB("Storage", ...objStores);

// indexDB stuff
async function createDB(name, ...objectStores) {
  let res;
  let request = indexedDB.open(name);
  request.onsuccess = async() => {
    db = request.result;
    objStores = db.objectStoreNames;
    if (objectStores.length > 0) {
      // open a new version to start the on upgrade needed function
      let currVersion = db.version;
      request = indexedDB.open(name, ++currVersion);
    }
  };
  request.onerror = requestErr; (err) => console.error;
  request.onupgradeneeded = async (e) => {
    db = await e.target.result;
    // for the first time add todos automatically
    console.table({oldVersion:e.oldVersion,newVersion:e.newVersion})
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


export {setItem as addTodo,deleteTodo,toggleCompletionStatus,getPage,objStores}