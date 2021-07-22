var db;
var objStores = ["Todos", "Ideas", "checklist", "cravings"];
var objectType = {
  autoIncrement: true,
  keyPath: "id",
};
function requestErr(err) {
  console.error(`error in request is :  ${err.target.error}`);
}
// check local storage at the start to prevent errors if not present set

function openTransaction(objectStore) {
  return db.transaction(objectStore, "readwrite").objectStore(objectStore);
}

// get items and split it to make an array
function getPage(objectStore) {
  return new Promise((resolve, reject) => {
    let res = [];
    let objStore = openTransaction(objectStore);
    let request = objStore.getAll();
    request.onerror = (e) => reject(e.target.error);
    request.onsuccess = (e) => {
      res = request.result.map(({ name, completed, id }) => {
        id = `${request.source.name} ${id}`;
        return { name, completed, id };
      });
      resolve(res);
    };
  });
}

// funtion to save todos
function setItem(objectStore, todoStr) {
  let objStore = openTransaction(objectStore);
  let req = objStore.add({
    completed: false,
    name: todoStr,
  });
  req.onerror = requestErr;
}

// to manage deletion and completion status we need id -->
// element id = objectStoreName + id(genrated from IDB)

// for deleting todos ->  remove element from html and local storage
function deleteTodo(id, objectStore) {
  let key = parseInt(id.split(" ")[1]);
  let objStore = openTransaction(objectStore);
  let request = objStore.delete(key);
  request.onerror = requestErr;
}

// for marking done -> add line-through and upadate in DB
function toggleCompletionStatus(id, objectStore) {
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

createDB("Storage");

function getCurrentDBversion(name) {
  return new Promise((resolve, reject) => {
    let version;
    let req = indexedDB.open(name);
    req.onsuccess = () => resolve(req.result.version);
    req.onerror = () => reject(req.error);
  });
}

// indexDB stuff
async function createDB(name, objectStoreName) {
  let request;
  if (objectStoreName !== "" && typeof objectStoreName !== "undefined") {
    let nextVersion = await getCurrentDBversion(name);
    nextVersion++;
    request = indexedDB.open(name, nextVersion);
  } else {
    request = indexedDB.open(name);
  }

  request.onsuccess = async () => {
    console.groupCollapsed("SUCCESS");
    console.dir(request);
    db = request.result;
    objStores = db.objectStoreNames;
    console.trace();
    console.dir(objStores);
    console.groupEnd();
  };
  request.onerror = requestErr;
  request.onupgradeneeded = async (e) => {
    console.group("UPGRADE");
    db = await e.target.result;
    // for a new version create new lists automatially
    if (e.oldVersion == 0) {
      ["Todos", "Ideas", "checklist", "cravings"].forEach((objStore) => {
        db.createObjectStore(objStore, objectType).add({
          completed: false,
          name: `this is an example of ${objStore}`,
        });
      });
    }
    //if other objectStoreNames are provided create an objectStore
    if (objectStoreName !== "" && typeof objectStoreName !== "undefined") {
      console.log(objectStoreName);
      db.createObjectStore(objectStoreName, objectType).add({
        completed: false,
        name: `this is an example of ${objectStoreName}`,
      });
    }
    objStores = db.objectStoreNames;
    console.table({
      origin: "upgrade",
      oldVersion: e.oldVersion,
      newVersion: e.newVersion,
    });
    console.trace();
    console.dir(objStores);
    console.groupEnd();
  };
}

function addObjStore(objStore) {
  db.close();
  createDB("Storage", objStore);
}

export {
  setItem as addTodo,
  deleteTodo,
  toggleCompletionStatus,
  getPage,
  addObjStore as newPage,
  objStores,
};
