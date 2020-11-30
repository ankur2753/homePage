//trying to code this one using the functional pradigm

function getEle(id) {
    return document.getElementById(id);
}

function toggleclass(element, classname) {
    if (element.classList.contains(classname)) {
        element.classList.remove(classname)
    } else element.classList.add(classname)
}

// get time and set that in center
function getCurrTime() {
    return new Date().toLocaleTimeString();
}

function formateTime(time) {
    let formatedTime = time.split(":", 2).map(element => {
        return element.padStart(2, 0)
    });
    return formatedTime[0] + " : " + formatedTime[1];
}

// update time evry minute 
setInterval(() => {
    getEle("time").innerText = formateTime(getCurrTime());
}, 1000);

// update date dynamically 
getEle("date").innerText = new Date().toLocaleDateString();


getEle("toggleMode").addEventListener("click", () => {
    toggleclass(document.body, "dark");
    toggleclass(getEle("sun"), "active");
    toggleclass(getEle("moon"), "active");
});


getEle("todo").addEventListener("click",()=>{
    toggleclass(getEle("todo-bar"), "active");
});


getEle("closeTodo").addEventListener("click",()=>{
    toggleclass(getEle("todo-bar"), "active");
});