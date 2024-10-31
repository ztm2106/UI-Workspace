// Get references to input fields, buttons, and containers
const teammateNameInput = document.getElementById('teammateNameInput');
const addTeammateBtn = document.getElementById('addTeammateBtn');
const teammateDropdown = document.getElementById('teammateDropdown');
const taskDescriptionInput = document.getElementById('taskDescriptionInput');
const dueDateInput = document.getElementById('dueDateInput');
const assignTaskBtn = document.getElementById('assignTaskBtn');
const taskContainer = document.getElementById('taskContainer');

// Message for no tasks
const noTasksMessage = document.createElement('p');
noTasksMessage.textContent = "No tasks right now. Please add a teammate and assign a task.";
taskContainer.appendChild(noTasksMessage);

// Initially display the message
noTasksMessage.style.display = 'block';

// Function to update visibility of the no tasks message
function updateNoTasksMessage() {
    const taskSections = taskContainer.getElementsByClassName('tasks-section');
    noTasksMessage.style.display = taskSections.length === 0 ? 'block' : 'none';
    taskContainer.appendChild(noTasksMessage);
}

// Add event listener to the "Add" button
addTeammateBtn.addEventListener('click', function() {
    const teammateName = teammateNameInput.value.trim();

    if (teammateName !== "") {
        let nameExists = false;
        for (let i = 0; i < teammateDropdown.options.length; i++) {
            if (teammateDropdown.options[i].value === teammateName) {
                nameExists = true;
                break;
            }
        }

        if (!nameExists) {
            const newOption = document.createElement('option');
            newOption.textContent = teammateName;
            newOption.value = teammateName;
            teammateDropdown.appendChild(newOption);

            sortDropdownOptions();
            saveAppState()
            teammateNameInput.value = ""; // Clear the input field
        } else {
            alert("This teammate already exists in the dropdown.");
        }
    } else {
        alert("Please enter a teammate name.");
    }
});

// Function to sort dropdown options alphabetically
function sortDropdownOptions() {
    const optionsArray = Array.from(teammateDropdown.options);
    optionsArray.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));

    teammateDropdown.innerHTML = ""; // Clear the dropdown
    optionsArray.forEach(option => teammateDropdown.appendChild(option)); // Re-populate with sorted options
}

// Add event listener to the "Assign" button
assignTaskBtn.addEventListener('click', function() {
    const selectedTeammate = teammateDropdown.value;
    const taskDescription = taskDescriptionInput.value.trim();
    const dueDate = dueDateInput.value;

    if (selectedTeammate === "Assign to" || taskDescription === "" || dueDate === "") {
        alert("Please select a teammate, enter a task description, and a due date.");
        return;
    }

    let teammateSection = document.getElementById(`teammate-${selectedTeammate}`);

    if (!teammateSection) {
        teammateSection = document.createElement('div');
        teammateSection.id = `teammate-${selectedTeammate}`;
        teammateSection.classList.add('tasks-section');
        
        const teammateHeading = document.createElement('h2');
        teammateHeading.textContent = selectedTeammate;
        teammateSection.appendChild(teammateHeading);

        taskContainer.appendChild(teammateSection); // Append the section to the task container
        saveAppState()

    }

    // Create a new task element
    const newTask = document.createElement('div');
    newTask.classList.add('task');

    const taskParagraph = document.createElement('p');
    taskParagraph.textContent = taskDescription;
    newTask.appendChild(taskParagraph);

    const taskDetails = document.createElement('div');
    newTask.classList.add('task-details');

    const dueDateSpan = document.createElement('span');
    dueDateSpan.textContent = `Due: ${dueDate}`;
    taskDetails.appendChild(dueDateSpan);

    const taskCheckbox = document.createElement('input');
    taskCheckbox.type = 'checkbox';

    taskCheckbox.addEventListener('change', function() {
        if (taskCheckbox.checked) {
            taskParagraph.style.textDecoration = 'line-through'; // Apply strikethrough
        } else {
            taskParagraph.style.textDecoration = 'none'; // Remove strikethrough
        }
        saveAppState()
    });

    taskDetails.appendChild(taskCheckbox);

    newTask.appendChild(taskDetails);
    teammateSection.appendChild(newTask);

    sortTasksByDueDate(teammateSection);

    sortTeammateSections();

    saveAppState()

    // Clear the input fields after task assignment
    taskDescriptionInput.value = "";
    dueDateInput.value = "";
});

// Function to sort teammate sections alphabetically by teammate name
function sortTeammateSections() {
    const sectionsArray = Array.from(taskContainer.getElementsByClassName('tasks-section'));

    sectionsArray.sort((a, b) => {
        const teammateA = a.querySelector('h2').textContent.toLowerCase();
        const teammateB = b.querySelector('h2').textContent.toLowerCase();
        return teammateA.localeCompare(teammateB);
    });

    taskContainer.innerHTML = ''; // Clear the container
    sectionsArray.forEach(section => taskContainer.appendChild(section)); // Re-populate with sorted sections
}

// Add event listener to the "Clear Completed" button
clearCompletedBtn.addEventListener('click', function() {
    const teammateSections = taskContainer.getElementsByClassName('tasks-section');

    // Iterate through each teammate section
    for (const section of teammateSections) {
        const tasks = section.getElementsByClassName('task');

        // Iterate backwards to safely remove items while looping
        for (let i = tasks.length - 1; i >= 0; i--) {
            const checkbox = tasks[i].querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                section.removeChild(tasks[i]); // Remove completed task
                saveAppState()
            }
        }

        // Check if the teammate section is empty and remove the section if it is
        if (section.getElementsByClassName('task').length === 0) {
            taskContainer.removeChild(section); // Remove teammate section if no tasks left
            saveAppState()
            
        } 
        // else if (taskContainer.getElementsByClassName('section').length === 0) {
        //     updateNoTasksMessage();
        // }
    }
    updateNoTasksMessage()
});

// Add event listener to the "Reset" button
resetBtn.addEventListener('click', function() {
    // Display a confirmation dialog
    const userConfirmed = confirm("Are you sure you want to reset all teammates and to-do items?");

    // If the user confirms, proceed with the reset
    if (userConfirmed) {
        // Clear all tasks and teammates
        taskContainer.innerHTML = ''; // Remove all task sections
        teammateDropdown.innerHTML = ''; // Remove all teammates from dropdown

        // Reset input fields
        teammateNameInput.value = '';
        taskDescriptionInput.value = '';
        dueDateInput.value = '';
        
        // Optionally reset the dropdown to the initial state
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Assign to';
        defaultOption.value = 'Assign to';
        teammateDropdown.appendChild(defaultOption);

        saveAppState();

        // Update the "No tasks" message
        updateNoTasksMessage();
    } 
    // If the user cancels, nothing happens and the reset is aborted
});

// Function to sort tasks by due date
function sortTasksByDueDate(teammateSection) {
    const tasks = Array.from(teammateSection.querySelectorAll('.task'));

    // Sort tasks by comparing their due dates
    tasks.sort((taskA, taskB) => {
        const dueDateA = new Date(taskA.querySelector('span').textContent.replace('Due: ', ''));
        const dueDateB = new Date(taskB.querySelector('span').textContent.replace('Due: ', ''));
        return dueDateA - dueDateB; // Sort in ascending order (earlier dates first)
    });

    // Re-append the sorted tasks in the correct order
    tasks.forEach(task => teammateSection.appendChild(task));
}

// Add this function to save the current state of the app
function saveAppState() {
    const appState = {
        teammates: Array.from(teammateDropdown.options).map(option => option.value),
        tasks: Array.from(taskContainer.getElementsByClassName('tasks-section')).map(section => {
            const teammateName = section.querySelector('h2').textContent;
            const tasks = Array.from(section.getElementsByClassName('task')).map(task => {
                return {
                    description: task.querySelector('p').textContent,
                    dueDate: task.querySelector('span').textContent.replace('Due: ', ''),
                    completed: task.querySelector('input[type="checkbox"]').checked
                };
            });
            return { teammateName, tasks };
        })
    };
    localStorage.setItem('appState', JSON.stringify(appState));
}

// Add this function to load the app state from localStorage on page load
function loadAppState() {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
        const appState = JSON.parse(savedState);

        // Restore teammates
        teammateDropdown.innerHTML = '';
        appState.teammates.forEach(teammate => {
            const option = document.createElement('option');
            option.textContent = teammate;
            option.value = teammate;
            teammateDropdown.appendChild(option);
        });
        sortDropdownOptions();

        // Restore tasks
        taskContainer.innerHTML = ''; // Clear the current tasks
        appState.tasks.forEach(section => {
            let teammateSection = document.createElement('div');
            teammateSection.id = `teammate-${section.teammateName}`;
            teammateSection.classList.add('tasks-section');

            const teammateHeading = document.createElement('h2');
            teammateHeading.textContent = section.teammateName;
            teammateSection.appendChild(teammateHeading);

            section.tasks.forEach(task => {
                const newTask = document.createElement('div');
                newTask.classList.add('task');

                // Create a wrapper to hold all task details in a single line
                const taskWrapper = document.createElement('div');
                taskWrapper.style.display = 'flex';
                taskWrapper.style.justifyContent = 'space-between';
                taskWrapper.style.alignItems = 'center'; // Vertically center the elements

                // Task description
                const taskParagraph = document.createElement('p');
                taskParagraph.textContent = task.description;
                taskParagraph.style.flex = '1'; // Ensure task takes most space
                taskWrapper.appendChild(taskParagraph);

                // Task details (Due date + Checkbox)
                const taskDetails = document.createElement('div');
                taskDetails.style.display = 'flex'; // Flex for date and checkbox alignment
                taskDetails.style.alignItems = 'center'; // Align them vertically

                // Due date span
                const dueDateSpan = document.createElement('span');
                dueDateSpan.textContent = `Due: ${task.dueDate}`;
                dueDateSpan.style.marginRight = '10px'; // Add space between date and checkbox
                taskDetails.appendChild(dueDateSpan);

                // Checkbox
                const taskCheckbox = document.createElement('input');
                taskCheckbox.type = 'checkbox';
                taskCheckbox.checked = task.completed;

                taskCheckbox.addEventListener('change', function() {
                    if (taskCheckbox.checked) {
                        taskParagraph.style.textDecoration = 'line-through';
                    } else {
                        taskParagraph.style.textDecoration = 'none';
                    }
                    saveAppState(); // Save state when checkbox is toggled
                });

                if (taskCheckbox.checked) {
                    taskParagraph.style.textDecoration = 'line-through';
                }

                taskDetails.appendChild(taskCheckbox);
                taskWrapper.appendChild(taskDetails); // Append task details to the wrapper
                newTask.appendChild(taskWrapper); // Append the wrapper to the task

                teammateSection.appendChild(newTask);
            });

            taskContainer.appendChild(teammateSection);
        });

        sortTeammateSections();
        updateNoTasksMessage();
    }
}



// Call loadAppState on page load
window.addEventListener('load', loadAppState);
