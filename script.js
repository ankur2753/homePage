var deleteTodos, changeStatus;
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
function clearContent(id) {
  getEle(id).innerHTML = "";
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

function displayEle(where, ele) {
  getEle(where).append(ele);
}
function getSelectedPageName() {
  return getEle("pageSelector").options[getEle("pageSelector").selectedIndex]
    .value;
}
function toggleModal() {
  if (getEle("modifyPopupBackground").style.display == "flex") {
    getEle("modifyPopupBackground").style.display = "none";
  } else {
    getEle("modifyPopupBackground").style.display = "flex";
  }
}

getEle("modifyPopupBackground").addEventListener("click", (e) => {
  // toggle modal on click outside the modal
  e.target == getEle("modifyPopupBackground") ? toggleModal() : null;
});
function showOption(option) {
  let page = document.createElement("option");
  page.value = option;
  page.text = option;
  displayEle("pageSelector", page);
}
function showList(option) {
  let list = document.createElement("div");
  list.classList.add("pageName");
  if (option == getSelectedPageName()) {
    list.classList.add("active");
  }
  let name = document.createElement("span");
  name.textContent = option;
  let deleteButton = document.createElement("button");
  deleteButton.classList.add("close", "btn");
  deleteButton.innerHTML = "&#9932;";
  displayEle("lists", list);
  list.append(name, deleteButton);
}
// ***********************************************//

import("./todo.js")
  .then(
    ({
      getPage,
      addTodo,
      deleteTodo,
      toggleCompletionStatus,
      newPage,
      objStores,
    }) => {
      objStores.forEach((objStore) => {
        showOption(objStore);
        showList(objStore);
      });
      deleteTodos = (id) => {
        deleteTodo(id, getSelectedPageName());
        changePage();
      };
      changeStatus = (id) => {
        toggleCompletionStatus(id, getSelectedPageName());
        toggleclass(getEle(id), "done");
        changePage();
      };
      async function changePage() {
        clearContent("todos");
        let x = await getPage(getSelectedPageName());
        x.forEach(({ name, completed, id }) => {
          displayEle("todos", createDivForTodo(completed, name, id));
        });
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
      getEle("addTodoContainer").addEventListener("submit", (e) => {
        e.preventDefault();
        try {
          let text = getEle("newTodo").value;
          if (text.length > 0) {
            addTodo(getSelectedPageName(), text);
            changePage();
          }
          getEle("newTodo").value = "";
        } catch (error) {
          alert(`opps something went wrong  ${error}`);
        }
      });

      //for the select dropdown set onchange function
      getEle("pageSelector").onchange = changePage;

      // for the add new page button
      getEle("addPage").addEventListener("click", () => {
        //create text input if left blank delete the input field
        let outerDiv = document.createElement("div");
        let form = document.createElement("form");
        let inp = document.createElement("input");
        outerDiv.classList.add("pageName");
        inp.style.width = "90%";
        form.style.width = "100%";
        form.style.margin = "auto";
        inp.setAttribute("type", "text");
        inp.setAttribute("placeholder", "press enter to submit");
        form.appendChild(inp);
        outerDiv.append(form);
        displayEle("lists", outerDiv);
        inp.focus();
        form.onsubmit = (e) => {
          if (inp.value.length > 0) {
            e.preventDefault();
            newPage(inp.value);
            showList(inp.value);
            showOption(inp.value);
            outerDiv.remove();
          } else outerDiv.remove();
        };
      });
    }
  )
  .catch(console.error);
indexedDB.deleteDatabase("Storage");
