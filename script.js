import {
  openDB,
  createList,
  deleteList,
  appendtoList,
  deleteFromList,
  updateList,
  getListContent,
} from "./todo.js";
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

// **********************************************************************************//

// to manage deletion and completion status we need id -->element id = objectStoreName + id(genrated from IDB)

// clears the content of todo-container
function clearContent(id) {
  getEle(id).innerHTML = "";
}

function changeStatus(id) {
  updateList(getSelectedPageName(), id);
  toggleclass(getEle(id), "done");
  changePage();
}
function deleteListItem(id) {
  deleteFromList(getSelectedPageName(), id);
  getEle(id).style.display = "none";
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
              <button class="btn" name="checkButton" >
               &check;
               </button>
               <button class="btn delete" name="deleteButton">
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
  let modal = getEle("modifyPopupBackground");
  if (modal.style.display == "flex") {
    modal.style.display = "none";
  } else {
    modal.style.display = "flex";
  }
  let list = getEle("lists");
  // add event listner for click on div
  list.querySelectorAll("div.pageName").forEach((div) =>
    div.addEventListener("click", (ev) => {
      let selected = ev.target.lastChild.textContent;
      let options = getEle("pageSelector").options;
      for (const option of options) {
        if (option.value == selected) {
          option.selected = true;
        }
      }
      refreshList();
    })
  );
  // add event listner dor deleteButton
  list.querySelectorAll(".close").forEach((btn) =>
    btn.addEventListener("click", async (ev) => {
      await deleteList("Storage", ev.target.previousSibling.textContent).then(
        (db) => db.close()
      );
      ev.target.parentElement.style.display = "none";
      await openDB("Storage").then((db) => {
        clearContent("pageSelector");
        let options = db.objectStoreNames;
        for (const opt of options) {
          showOption(opt);
        }
        db.close();
      });
    })
  );

  changePage();
}
function showOption(option) {
  let page = document.createElement("option");
  page.value = option;
  page.text = option;
  displayEle("pageSelector", page);
}
function showList(option) {
  let list = document.createElement("div");
  list.classList.add("pageName");
  let name = document.createElement("span");
  name.classList.add("btn");
  name.textContent = option;
  let deleteButton = document.createElement("button");
  deleteButton.classList.add("close", "btn");
  deleteButton.innerHTML = "&#9932;";
  displayEle("lists", list);
  list.append(name, deleteButton);
}
function refreshList() {
  // remove active class from previous element to new element
  getEle("lists")
    .querySelectorAll("span")
    .forEach((listName) => {
      listName.textContent == getSelectedPageName()
        ? listName.parentElement.classList.add("active")
        : listName.parentElement.classList.remove("active");
    });
}
async function changePage() {
  // clear the content of div#todos
  clearContent("todos");
  // get content from the IDB
  let listContents = await getListContent(getSelectedPageName());
  listContents.forEach(({ name, completed, id }) => {
    displayEle("todos", createDivForTodo(completed, name, id));
  });
  // add delete and check status function to onclick events
  document.querySelectorAll("button[name='checkButton']").forEach((btn) => {
    btn.addEventListener("click", (ele) => {
      console.log(ele.target.parentElement.parentElement.id);
      changeStatus(ele.target.parentElement.parentElement.id);
    });
  });
  document.querySelectorAll("button[name='deleteButton']").forEach((btn) =>
    btn.addEventListener("click", (ele) => {
      deleteListItem(ele.target.parentElement.parentElement.id);
    })
  );
  refreshList();
}
// ******************************************************************************************************//
themeing();
// display date time on page load
updateDateTime(new Date());

// update date&time evry minute
setInterval(() => {
  let date = new Date();
  updateDateTime(date);
}, 1000);
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
async function populateUI() {
  await openDB("Storage").then((db) => {
    [getEle("pageSelector"), getEle("lists")].forEach(
      (continer) => (continer.innerHTML = "")
    );
    let pageNames = db.objectStoreNames;
    for (const page of pageNames) {
      showOption(page);
      showList(page);
    }
    db.close();
  });
}
populateUI();
// modal popup control@
getEle("modifyPageBtn").addEventListener("click", toggleModal);
getEle("modifyPopupBackground").addEventListener("click", (e) => {
  // toggle modal on click outside the modal
  e.target == getEle("modifyPopupBackground") ? toggleModal() : null;
  // handle click on list names
});

// enable and disable nav bar on click
getEle("todo").addEventListener("click", async () => {
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
      appendtoList(getSelectedPageName(), text);
      changePage();
    }
    getEle("newTodo").value = "";
  } catch (error) {
    alert(`opps something went wrong  ${error}`);
  }
});

//   //for the select dropdown set onchange function
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
  form.onsubmit = async (e) => {
    if (inp.value.length > 0) {
      e.preventDefault();
      showOption(inp.value);
      await createList("Storage", inp.value);
      showList(inp.value);
      outerDiv.remove();
    } else outerDiv.remove();
  };
});
