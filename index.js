// TASK: import helper functions from utils
import {
  getTasks,
  createNewTask,
  patchTask,
  deleteTask,
} from "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  // Check if tasks data exists in localStorage
  if (!localStorage.getItem("taskList")) {
    // If not, set initialData to localStorage
    localStorage.setItem("taskList", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
  // Check if showSideBar flag exists in localStorage, if not set it to true
  if (!localStorage.getItem("showSideBar")) {
    localStorage.setItem("showSideBar", "true");
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById("header-board-name"), // Getting header board name element
  columnDivs: document.querySelectorAll(".column-div"), // Getting all column div elements
  showSideBarBtn: document.getElementById("show-side-bar-btn"), // Getting show sidebar button element
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"), // Getting hide sidebar button element
  themeSwitch: document.getElementById("switch"), // Getting theme switch element
  createNewTaskBtn: document.getElementById("add-new-task-btn"), // Getting create new task button element
  modalWindow: document.getElementById("new-task-modal-window"), // Getting new task modal window element
  filterDiv: document.getElementById("filterDiv"), // Getting filter div element
  editTaskModal: document.querySelector(".edit-task-modal-window"), // Getting edit task modal window element
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task) => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.board === boardName && task.status === status)
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        // Listen for a click event on each task and open a modal
        taskElement.addEventListener("click", () => {
          openEditTaskModal(task);
        });

        tasksContainer.appendChild(taskElement);
      });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () =>
    toggleModal(false, elements.editTaskModal)
  );

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none";
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object
  const task = {
    id: new Date().getTime(),
    title: event.target.elements["title-input"].value,
    description: event.target.elements["desc-input"].value,
    status: event.target.elements["select-status"].value,
    board: activeBoard,
  };
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

function toggleSidebar(show) {
  const sideBarDiv = document.getElementById("side-bar-div"); // Getting sidebar div element
  const layoutDiv = document.getElementById("layout"); // Getting layout div element
  const showSideBarBtn = document.getElementById("show-side-bar-btn"); // Getting show sidebar button element
  const boardNameContainer = document.getElementById("header-board-name"); // Getting board name container element
  const tasksContainers = document.querySelectorAll(".tasks-container"); // Getting all tasks container elements

  if (show) {
    // Show sidebar
    sideBarDiv.style.transform = "translateX(0)"; // Translating sidebar to show
    layoutDiv.style.width = "calc(100% - 350px)"; // Adjusting layout width
    showSideBarBtn.style.display = "none"; // Hiding show sidebar button
    localStorage.setItem("showSideBar", "true"); // Setting show sidebar flag in localStorage

    // Revert board name container and tasks container to original styles
    boardNameContainer.style.width = ""; // Revert width to auto
    tasksContainers.forEach((container) => (container.style.width = "")); // Revert width to auto for all tasks containers
  } else {
    // Hide sidebar
    sideBarDiv.style.transform = "translateX(-100%)"; // Translating sidebar to hide
    layoutDiv.style.width = "100%"; // Setting layout width to full
    showSideBarBtn.style.display = "block"; // Showing show sidebar button
    layoutDiv.style.width = "100%"; // Full width when sidebar is hidden

    // Expand board name container and tasks containers to take over viewport
    boardNameContainer.style.width = "100vw"; // Expand to full viewport width
    tasksContainers.forEach((container) => (container.style.width = "100vw")); // Expand to full viewport width for all tasks containers

    localStorage.setItem("showSideBar", "false"); // Setting show sidebar flag in localStorage
  }
}

function toggleTheme() {
  // Implement toggle theme functionality
  const isLightTheme = document.getElementById("switch").checked;
  document.body.classList.toggle("light-theme", isLightTheme);
  localStorage.setItem("light-theme", isLightTheme ? "enabled" : "disabled");
  const logoImg = document.getElementById("logo");

  logoImg.src = isLightTheme
    ? "./assets/logo-light.svg"
    : "./assets/logo-dark.svg";
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.getElementById("edit-task-title-input").value = task.title;
  document.getElementById("edit-task-desc-input").value = task.description;
  document.getElementById("edit-select-status").value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById("save-task-changes-btn");
  const deleteTaskBtn = document.getElementById("delete-task-btn");

  saveChangesBtn.addEventListener("click", () => {
    saveTaskChanges(task.id); //
  });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener("click", () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  });

  toggleModal(true, elements.editTaskModal);
}

function saveTaskChanges(taskId) {
  const updatedTitle = document.getElementById("edit-task-title-input").value;
  const updatedDescription = document.getElementById(
    "edit-task-desc-input"
  ).value;
  const updatedStatus = document.getElementById("edit-select-status").value;

  const updates = {
    title: updatedTitle,
    description: updatedDescription,
    status: updatedStatus,
  };

  patchTask(taskId, updates); // Updating task

  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  fetchAndDisplayBoardsAndTasks();
}
