var deleteTodos, changeStatus, currentObjStore;
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
    changeTheme("dark");
    localStorage.setItem("theme", "dark"); //add this
  } else {
    changeTheme("light");
    localStorage.setItem("theme", "light"); //add this
  }
}
function changeTheme(themeString) {
  document.documentElement.setAttribute("data-theme", themeString);
}

// for darkmode toggle class on click

getEle("checkbox").addEventListener("change", switchTheme);
// check local storage for last theme
function themeing() {
  let lastTheme = localStorage.getItem("theme");
  if (!lastTheme) return;
  changeTheme(lastTheme);
  if (lastTheme == "dark") {
    getEle("checkbox").checked = true;
  }
}
themeing();
// ************************************************//

// clears the content of todo-container
function clearDivs() {
  getEle("todos").innerHTML = "";
}

// creates a div with formating to
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
  return `<div class="string">${todoStr}</div>
              <div class="actions">
               <button class="btn"  onclick="changeStatus(this.parentElement.parentElement.id)">
               &check;
               </button>
               <button class="btn delete"  onclick='deleteTodos(this.parentElement.parentElement.id)'>
               &#128465;
               </button>
              </div>
              `;
}

function displayDiv(div) {
  getEle("todos").appendChild(div);
}
function getSelectedPageIndex() {
  return getEle("pageSelector").selectedIndex;
}

// ***********************************************//

import("./todo.js")
  .then(
    ({ getPage, addTodo, deleteTodo, toggleCompletionStatus, objStores }) => {
      deleteTodos = (id) => {
        deleteTodo(id, currentObjStore);
        changePage();
      };
      changeStatus = (id) => {
        toggleCompletionStatus(id, currentObjStore);
        console.log(getEle(id).childNodes);
        toggleclass(getEle(id), "done");
        changePage();
      };
      function changePage() {
        clearDivs();
        currentObjStore = objStores[getSelectedPageIndex()];
        getPage(currentObjStore);
      }
      // enable and disable nav bar on click
      getEle("todo").addEventListener("click", () => {
        toggleclass(getEle("todo-bar"), "active");
        changePage();
      });
      getEle("closeTodo").addEventListener("click", () => {
        toggleclass(getEle("todo-bar"), "active");
      });

      // add todos on click
      getEle("addTodo").addEventListener("click", () => {
        try {
          let text = getEle("newTodo").value;
          if (text.length > 0) {
            addTodo(currentObjStore, text);
            changePage();
          }
          getEle("newTodo").value = "";
        } catch (error) {
          alert(`opps something went wrong  ${error}`);
        }
      });

      getEle("pageSelector").onchange = changePage;
    }
  )
  .catch((error) => {
    console.error(error);
  });
