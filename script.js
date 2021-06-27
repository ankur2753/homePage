//trying to code this one using the functional pradigm

function getEle(id) {
  return document.getElementById(id);
}

function toggleclass(element, classname) {
  if (element.classList.contains(classname)) {
    element.classList.remove(classname);
  } else element.classList.add(classname);
}

// get time and formate its
function getCurrTime(dateObject) {
  return dateObject.toLocaleTimeString();
}

function formateTime(time) {
  let formatedTime = time.split(":").map((element) => {
    return element.padStart(2, 0);
  });
  return formatedTime[0] + " : " + formatedTime[1];
}

function getSeconds(dateObj) {
  return dateObj.toLocaleString().split(":")[2].split(" ")[0];
}

function updateDateTime(dateObj) {
  getEle("time").innerText = formateTime(getCurrTime(dateObj));
  getEle("seconds").innerText = " : " + getSeconds(dateObj);
  getEle("date").innerText = `${[
    dateObj.getDate(),
    dateObj.getMonth() + 1,
    dateObj.getFullYear(),
  ].join("/")}`;
}
// display date time on page load
updateDateTime(new Date());

// update date&time evry minute
setInterval(() => {
  let date = new Date();
  updateDateTime(date);
}, 1000);

function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark"); //add this
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light"); //add this
  }
}

// for darkmode toggle class on click

getEle("checkbox").addEventListener("change",switchTheme);
document.addEventListener("loadeddata",document.documentElement.setAttribute("data-theme",localStorage.getItem("theme")))

// ************************************************//
  
// ***********************************************//

import("./todo.js")
  .then(({ getPage, clearDivs, currentObjStore, objStores }) => {
    // enable and disable nav bar on click
    getEle("todo").addEventListener("click", () => {
      toggleclass(getEle("todo-bar"), "active");
      clearDivs();
      getPage(currentObjStore);
    });
    getEle("closeTodo").addEventListener("click", () => {
      toggleclass(getEle("todo-bar"), "active");
    });

    // add todos on click
    getEle("addTodo").addEventListener("click", () => {
      try {
        let text = getEle("newTodo").value;
        if (text.length > 0) {
          setItem(currentObjStore, text);
          clearDivs();
          getPage(currentObjStore);
        }
        getEle("newTodo").value = "";
      } catch (error) {
        alert(`opps something went wrong  ${error}`);
      }
    });

    document.querySelectorAll(".tabs").forEach((radiobutton) => {
      radiobutton.addEventListener("click", () => {
        currentObjStore = objStores[radiobutton.value];
        clearDivs();
        getPage(currentObjStore);
      });
    });
  })
  .catch((error) => {
    console.error(error);
  });
    