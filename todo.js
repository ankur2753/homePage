var db;
let request = indexedDB.open("Storage");
request.onsuccess = ()=>{db =request.result;console.log(db);}
request.onerror =err => console.error;
request.onupgradeneeded= e => {
    db = e.target.result;
    db.createObjectStore("Todos",{autoIncrement:true,keyPath:"id"}).createIndex("by_DONE","completed",{unique:false});
}