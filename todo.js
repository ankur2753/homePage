var defaultLists = ["Todos", "Ideas", "checklist", "cravings"]; //default values these values change once DB is open
var objectType = {
  autoIncrement: true,
  keyPath: "id",
};
// use genrator function to make it better
async function openTransaction(objectStore) {
  let db = await openDB("Storage");
  let tx = db.transaction(objectStore, "readwrite");
  tx.onerror = console.error;
  tx.oncomplete = (res) => {
    res.target.db.close();
  };
  return tx.objectStore(objectStore);
}

// get items and split it to make an array
async function getListContent(objectStore) {
  let objStore = await openTransaction(objectStore);
  let request = objStore.getAll();
  return new Promise((resolve, reject) => {
    request.onerror = (e) => reject(e.target.error);
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

// // funtion to save todos
async function appendtoList(listName, listContent) {
  let objStore = await openTransaction(listName);
  let req = objStore.add({
    completed: false,
    name: listContent,
  });
  req.onerror = console.warn;
}

// for deleting todos ->  remove element from html and local storage
async function deleteFromList(listName, key) {
  let objStore = await openTransaction(listName);
  let request = objStore.delete(parseInt(key));
  request.onerror = console.warn;
}

// for marking done -> add line-through and upadate in DB
async function updateList(listName, key) {
  let objStore = await openTransaction(listName);
  let request = objStore.get(parseInt(key));
  request.onsuccess = (e) => {
    let value = e.target.result;
    value.completed = !value.completed;
    objStore.put(value);
  };
  request.onerror = console.warn;
}

function getCurrentDBversion(name) {
  return new Promise((resolve, reject) => {
    let req = indexedDB.open(name);
    req.onsuccess = () => {
      resolve(req.result.version);
      req.result.close();
    };
    req.onerror = () => reject(req.error);
  });
}
async function openRequest(dbName, objectStoreName) {
  let request;
  if (objectStoreName !== "" && typeof objectStoreName !== "undefined") {
    let nextVersion = await getCurrentDBversion(dbName);
    nextVersion++;
    request = indexedDB.open(dbName, nextVersion);
  } else {
    request = indexedDB.open(dbName);
  }
  return request;
}
// create an indexDB with the given name
async function openDB(dbName) {
  let request = await openRequest(dbName);
  request.addEventListener("upgradeneeded", (e) => {
    // NOTE:- this should be abstracted later for better reuseablity
    // for a new version create default lists automatially
    if (e.oldVersion == 0) {
      defaultLists.forEach((objStore) => {
        request.result.createObjectStore(objStore, objectType).add({
          completed: false,
          name: `this is an example of ${objStore}`,
        });
      });
    }
  });
  return new Promise((resolve, reject) => {
    request.onsuccess = async () => {
      resolve(request.result);
    };
    request.onerror = (e) => {
      requestErr(e);
      reject("Some Error in request");
    };
  });
}

async function createList(dbName, objectStoreName) {
  let request = await openRequest(dbName, objectStoreName);
  request.onupgradeneeded = async (e) => {
    let db = await e.target.result;
    //if other objectStoreNames are provided create an objectStore
    if (objectStoreName !== "" && typeof objectStoreName !== "undefined") {
      if (!db.objectStoreNames.contains(objectStoreName)) {
        db.createObjectStore(objectStoreName, objectType).add({
          completed: false,
          name: `this is an example of ${objectStoreName}`,
        });
      }
    }
  };
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
      request.result.close();
    };
    request.onerror = (err) => {
      reject(`Some Error in request : \n ${err.target.error}`);
    };
  });
}
async function deleteList(dbName, objectStoreName) {
  let request = await openRequest(dbName, objectStoreName);
  return new Promise((resolve, reject) => {
    request.onupgradeneeded = async (e) => {
      let db = await e.target.result;
      db.deleteObjectStore(objectStoreName);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onblocked = request.onerror = () => reject(request);
  });
}
export {
  openDB,
  createList,
  appendtoList,
  deleteFromList,
  updateList,
  getListContent,
  deleteList,
};
