/* Todo App with Authentication */

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Display user name
    document.getElementById('userName').textContent = currentUser.name;
    
    // Initialize todo app
    initializeTodoApp();
});

let todoItemsContainer = document.getElementById("todoItemsContainer");
let addTodoButton = document.getElementById("addTodoButton");
let saveTodoButton = document.getElementById("saveTodoButton");
let emptyState = document.getElementById("emptyState");
let taskCounter = document.getElementById("taskCounter");

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function initializeTodoApp() {
    // Initialize todo functionality after authentication check
    initializeTodos();
}

function getTodoListFromLocalStorage() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const userTodoKey = `todoList_${currentUser.id}`;
    let stringifiedTodoList = localStorage.getItem(userTodoKey);
    let parsedTodoList = JSON.parse(stringifiedTodoList);
    if (parsedTodoList === null) {
        return [];
    } else {
        return parsedTodoList;
    }
}

let todoList = [];

function getNextTodoId() {
    if (todoList.length === 0) {
        return 1;
    }
    let maxId = Math.max(...todoList.map(todo => todo.uniqueNo));
    return maxId + 1;
}

function initializeTodos() {
    todoList = getTodoListFromLocalStorage();
    
    // Set up event listeners
    addTodoButton.onclick = function() {
        onAddTodo();
    };

    // Add Enter key support for input field
    document.getElementById("todoUserInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            onAddTodo();
        }
    });
    
    // Load existing todos
    for (let todo of todoList) {
        createAndAppendTodo(todo);
    }

    // Initialize empty state
    updateEmptyState();
}

function updateTaskCounter() {
    let completedTasks = todoList.filter(todo => todo.isChecked).length;
    let totalTasks = todoList.length;
    
    if (totalTasks === 0) {
        taskCounter.textContent = "";
    } else {
        taskCounter.textContent = `${completedTasks} of ${totalTasks} tasks completed`;
    }
}

function updateEmptyState() {
    if (todoList.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
    }
    updateTaskCounter();
}

function saveTodoList() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userTodoKey = `todoList_${currentUser.id}`;
    localStorage.setItem(userTodoKey, JSON.stringify(todoList));
    updateEmptyState();
}

saveTodoButton.onclick = function() {
    saveTodoList();
    // Visual feedback for save action
    let originalText = saveTodoButton.textContent;
    saveTodoButton.textContent = "Saved!";
    saveTodoButton.style.backgroundColor = "#28a745";
    setTimeout(function() {
        saveTodoButton.textContent = originalText;
        saveTodoButton.style.backgroundColor = "#4c63b6";
    }, 1000);
};

function onAddTodo() {
    let userInputElement = document.getElementById("todoUserInput");
    let userInputValue = userInputElement.value.trim();

    if (userInputValue === "") {
        alert("Enter Valid Text");
        userInputElement.focus();
        return;
    }

    let newTodo = {
        text: userInputValue,
        uniqueNo: getNextTodoId(),
        isChecked: false
    };
    todoList.push(newTodo);
    createAndAppendTodo(newTodo);
    userInputElement.value = "";
    saveTodoList(); // Auto-save when adding new todo
}



function onTodoStatusChange(checkboxId, labelId, todoId) {
    let checkboxElement = document.getElementById(checkboxId);
    let labelElement = document.getElementById(labelId);
    labelElement.classList.toggle("checked");

    let todoEleIndex = todoList.findIndex(function(eachItem) {
        let eachTodoId = "todo" + eachItem.uniqueNo;
        if (eachTodoId === todoId) {
            return true;
        } else {
            return false;
        }
    });

    let todoObj = todoList[todoEleIndex];
    if (todoObj.isChecked === true) {
        todoObj.isChecked = false;
    } else {
        todoObj.isChecked = true;
    }
    
    saveTodoList(); // Auto-save when status changes
}

function onDeleteTodo(todoId) {
    // Find the todo item to get its text for confirmation
    let deleteElementIndex = todoList.findIndex(function(eachTodo) {
        let eachTodoId = "todo" + eachTodo.uniqueNo;
        return eachTodoId === todoId;
    });

    if (deleteElementIndex === -1) {
        console.error("Todo item not found");
        return;
    }

    let todoText = todoList[deleteElementIndex].text;
    let confirmDelete = confirm(`Are you sure you want to delete "${todoText}"?`);
    
    if (confirmDelete) {
        let todoElement = document.getElementById(todoId);
        if (todoElement) {
            todoItemsContainer.removeChild(todoElement);
            todoList.splice(deleteElementIndex, 1);
            saveTodoList(); // Auto-save when deleting todo
        }
    }
}

function createAndAppendTodo(todo) {
    let todoId = "todo" + todo.uniqueNo;
    let checkboxId = "checkbox" + todo.uniqueNo;
    let labelId = "label" + todo.uniqueNo;

    let todoElement = document.createElement("li");
    todoElement.classList.add("todo-item-container", "d-flex", "flex-row");
    todoElement.id = todoId;
    todoItemsContainer.appendChild(todoElement);

    let inputElement = document.createElement("input");
    inputElement.type = "checkbox";
    inputElement.checked = todo.isChecked;
    inputElement.id = checkboxId;

    inputElement.onclick = function() {
        onTodoStatusChange(checkboxId, labelId, todoId);
    };

    inputElement.classList.add("checkbox-input");
    todoElement.appendChild(inputElement);

    let labelContainer = document.createElement("div");
    labelContainer.classList.add("label-container", "d-flex", "flex-row");
    todoElement.appendChild(labelContainer);

    let labelElement = document.createElement("label");
    labelElement.setAttribute("for", checkboxId);
    labelElement.id = labelId;
    labelElement.classList.add("checkbox-label");
    labelElement.textContent = todo.text;
    if (todo.isChecked === true) {
        labelElement.classList.add("checked");
    }
    labelContainer.appendChild(labelElement);

    let deleteIconContainer = document.createElement("div");
    deleteIconContainer.classList.add("delete-icon-container");
    labelContainer.appendChild(deleteIconContainer);

    let deleteIcon = document.createElement("i");
    deleteIcon.classList.add("far", "fa-trash-alt", "delete-icon");

    deleteIcon.onclick = function() {
        onDeleteTodo(todoId);
    };
    
    // Add keyboard support for delete icon
    deleteIcon.setAttribute('tabindex', '0');
    deleteIcon.setAttribute('role', 'button');
    deleteIcon.setAttribute('aria-label', `Delete task: ${todo.text}`);
    deleteIcon.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onDeleteTodo(todoId);
        }
    });

    deleteIconContainer.appendChild(deleteIcon);
}

