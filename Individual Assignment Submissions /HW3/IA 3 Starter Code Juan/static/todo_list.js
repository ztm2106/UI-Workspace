$(document).ready(function() {
    let dropdown = $("#dropdown");
    let assignButton = $("#assign-button");
    let addButton = $("#add-button");
    let clearButton = $("#clear-button");
    let resetButton = $("#reset-button");
    let teammateName = $('#name-input');
    let taskInput = $('#task-input');
    let dateInput = $('#date-input');
    let FRE = true
    let flag = false;

    tasksByTeammate = {};
    dropdownNames = [];
    temmatesList=[];
    precompleted = [];

    function renderitems(data) {
    
        // Insert all of the new data
        $.each(data, function(i, datum){
            let teammateName = datum["name"];
            dropdownNames.push(teammateName);
            // temmatesList.push(teammateName);
            if (datum["task"]) {
                tasksByTeammate[teammateName] = [];
            }
            $.each(datum["task"], function(j, task) {
                let taskDetails = task;
                let taskDate = new Date(datum["date"][j]);
    
                // Add task details and date to tasksByTeammate for this teammate
                tasksByTeammate[teammateName].push({
                    task: taskDetails,
                    date: taskDate
                });
                precompleted.push(datum["completed"][j]);
            }); 
        });
    }

    function saveDropdownNames (dropdownNames){
        const existingNames = data.map(datum => datum["name"]);

        // Filter dropdownNames to include only names not present in data['name']
        const newNames = dropdownNames.filter(element => !existingNames.includes(element));
        newNames.forEach(element => {
            var dataToSave = {
                "name": element,
                "task": null,
                "completed": null,
                "date": null
            }
            $.ajax({
                type: "POST",
                url: "add_teammate",
                dataType : "json",
                contentType: "application/json; charset=utf-8",
                data : JSON.stringify(dataToSave),
                success: function(result) {
                    var allData = result["data"]
                    data = allData
                },
                error: function(request, status, error) {
                    console.log("Error");
                    console.log(request)
                    console.log(status)
                    console.log(error)
                }
            });
            
        });
    }

    function saveTasksByTeammate(tasksByTeammate){
        // debugger;
        Object.keys(tasksByTeammate).forEach(teammateName => {

            tasksByTeammate[teammateName].forEach(taskObj => {
                let existingTasks = data.find(datum => datum["name"] === teammateName)?.["task"] || [];
                const isTaskRepeated = existingTasks.includes(taskObj.task);
                if (!isTaskRepeated) {
                    curr_date = taskObj.date;
                    let formattedDate = String(curr_date.getMonth() + 1).padStart(2, '0') + '/' +
                    String(curr_date.getDate()).padStart(2, '0') + '/' +
                    curr_date.getFullYear();
                    // console.log("formattedDate", formattedDate)
                    var dataToSave = {
                        "name": teammateName,
                        "task": taskObj.task,
                        "completed": false,
                        "date": formattedDate
                    };

                    console.log("dataToSave", dataToSave);
                    $.ajax({
                        type: "POST",
                        url: "add_task",
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(dataToSave),
                        success: function(result) {
                            var allData = result["data"];
                            data = allData;  // Update global data with the response
                            console.log(data);
                        },
                        error: function(request, status, error) {
                            console.log("Error");
                            console.log(request);
                            console.log(status);
                            console.log(error);
                        }
                    });
                }
            })
        })
        
    }

    function saveChecked(name, task, date, checked){

        // Format the date to match the backend format (MM/DD/YYYY)
        let formattedDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
        var dataToSave = {
            "name": name,
            "task": task,
            "completed": checked,
            "date": formattedDate
        };

        console.log("dataToSave", dataToSave);
        $.ajax({
            type: "POST",
            url: "update_task_status",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(dataToSave),
            success: function(result) {
                var allData = result["data"];
                data = allData;  // Update global data with the response
                console.log(data);
            },
            error: function(request, status, error) {
                console.log("Error");
                console.log(request);
                console.log(status);
                console.log(error);
            }
        });
    }

    function saveClearedState(tasksByTeammate) {
        var dataToSave = []
        Object.keys(tasksByTeammate).forEach(function(teammateName) {
            var task_list = [];
            var date_list = [];
            var completed_list = [];
            tasksByTeammate[teammateName].forEach(function(taskObj) {
                // Format date
                var curr_date = taskObj.date;
                let formattedDate = String(curr_date.getMonth() + 1).padStart(2, '0') + '/' +
                    String(curr_date.getDate()).padStart(2, '0') + '/' +
                    curr_date.getFullYear();
    
                task_list.push(taskObj.task);
                date_list.push(formattedDate);
                completed_list.push(false); // Assuming remaining tasks are not completed
            });

            dataToSave.push({
                "name": teammateName,
                "task": task_list,
                "completed": completed_list,
                "date": date_list
            });
        });
        $.ajax({
            type: "POST",
            url: "update_tasks",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(dataToSave),
            success: function(result) {
                var allData = result["data"];
                data = allData;  // Update global data with the response
                console.log("Tasks updated successfully:", data);
            },
            error: function(request, status, error) {
                console.log("Error updating tasks");
                console.log(request);
                console.log(status);
                console.log(error);
            }
        });
    }
    
    function resetDataOnServer() {
        $.ajax({
            type: "POST",
            url: "reset_data",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(result) {
                console.log("Data reset successfully on the server.");
                // Optionally, handle any response or update client-side data if necessary
            },
            error: function(request, status, error) {
                console.log("Error resetting data on server");
                console.log(request);
                console.log(status);
                console.log(error);
            }
        });
    }
    
       
    console.log("DATATAT", data)
    renderitems(data);  // Pass Flask data to JS function
    console.log("tasksByTeammate right after load", tasksByTeammate)
    checkEmptyContent();
    
    function checkEmptyContent() {
        let taskDetailsContainer = $("#task-details-container");

        if (temmatesList.length === 0 && Object.keys(tasksByTeammate).length === 0 && dropdownNames.length ===0) {
            taskDetailsContainer.empty();
            dropdown.prepend('<option value="" selected>Assign to</option>');
            defaultTaskView();
        }
        else {
            //restore Dropdown
            dropdown.prepend('<option value="" disabled>Assign to</option>');
            dropdownNames.forEach(function(name) {
                dropdown.append(`<option value="${name}" selected>${name}</option>`);
            });
            sortDropdown();
            if (Object.keys(tasksByTeammate).length === 0){
                defaultTaskView();
            }else{
                console.log("dropdownNames", dropdownNames)
                console.log("tasksByTeammate", tasksByTeammate)
                // debugger;
                Object.keys(tasksByTeammate).forEach(function(name) {
                    // console.log("Perro we here", tasksByTeammate[name])
                    if (tasksByTeammate[name].length === 0) {
                        return;  // This works like Python's 'continue'
                    }
                    tasksByTeammate[name].forEach(function(task) {

                        let currentName = name;
                        let currentTask = task; 
                        // console.log("NAME", name)
                        addStudentTittle(currentName);
                        let taskDetails= $(`#${currentName}-task-details`);
                        tasksByTeammate[currentName].sort(function(a, b) {
                            return a.date - b.date;
                        });
                        let newTask = $('<div>').addClass("task");
                        let taskSpan = $('<span>').text(currentTask.task);
                        let newDiv = $('<div>');
                        let taskDate = new Date(currentTask.date);
                
                        // Format the date as MM/DD/YYYY
                        let formattedDate = taskDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit"
                        });
                        let dateSpan = $('<span>').addClass("due-date").text(`Due: ${formattedDate}`);
                        let checkbox = $('<input>').attr('type', 'checkbox');
                        if (precompleted.length > 0) {
                            let isCompleted = precompleted[0];
                            
                            if (isCompleted) {
                                checkbox.prop('checked', true);
                                newTask.addClass("completed");
                            }
                            precompleted.shift();
                        }
                        checkbox.change(function() {
                            if (this.checked) {
                                newTask.addClass("completed");
                            } 
                            else {
                                newTask.removeClass("completed");
                            }
                            debugger;
                            console.log("Hereeee")
                            saveChecked(currentName, currentTask.task, currentTask.date, this.checked);
                        });
                        newDiv.append(dateSpan, checkbox);
                        newTask.append(taskSpan, newDiv);
                        taskDetails.append(newTask);});
                });

            }
        }
    }
    
    function sortDropdown() {
        let dropdown = $("#dropdown");
        let options = dropdown.find('option');
        let defaultOption = options.filter('[value=""]');
        let sortedOptions = options.not(defaultOption).sort(function(a, b) {
            return $(a).text().localeCompare($(b).text());
        });
        dropdown.empty().append(defaultOption, sortedOptions);
    };

    addButton.click(function() 
    {
        let name = teammateName.val().trim();
        if (name !== "") {
            let nameExists = false;
            dropdown.find('option').each(function() {
                if ($(this).text().toLowerCase() === name.toLowerCase()) {
                    nameExists = true;  // Set flag if a match is found
                    return false;        // Exit the loop early
                }
            });

            if (!nameExists) {
                dropdownNames.push(name);
                saveDropdownNames(dropdownNames);
                dropdown.append(`<option value="${teammateName.val()}" selected>${teammateName.val()}</option>`);
                sortDropdown();
                dropdown.find('option[value=""]').prop('disabled', true);
                teammateName.val("");
            } else {
                alert(name + " already exists!");
            }
        } 
        else {
            alert("Please enter a name");
        }
    });

    assignButton.click(function() {
        if (flag) {
            let taskDetailsContainer = $("#task-details-container");
            flag = !flag;
            taskDetailsContainer.empty();
        }

        let name = dropdown.find('option:selected').text()
        let task = taskInput.val().trim();
        let date = dateInput.val();
        if (name === "Assign to" || task === "") {
            alert("Please enter a valid name and task");
            // let test = JSON.parse(localStorage.getItem('state_tasks')) || {};
            // console.log("FRE", FRE)
            // if (Object.keys(test).length !== 0){
            //     FRE = false;
            // }
            // if (FRE || Object.keys(test).length === 0){
            //     let taskDetailsContainer = $("#task-details-container");
            //     taskDetailsContainer.empty();
            //     defaultTaskView();
            // }
            // return;
        }
        let inputDate = new Date(date);
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        if (inputDate < currentDate || date === "") {
            alert(`Please enter a valid date after ${currentDate.toLocaleDateString()}`);
            if (Object.keys(test).length === 0 ){
                let taskDetailsContainer = $("#task-details-container");
                taskDetailsContainer.empty();
                defaultTaskView();
            }
            return;
        }

        if ($(`#${name}-task-details`).length === 0) {
            addStudentTittle(name);
        }
        addTask(name, task, date);
        taskInput.val("");
        dateInput.val("");
    });

    clearButton.click(function() {
        let checkedTasks = $('input[type="checkbox"]:checked');
        if (checkedTasks.length === 0) {
            return;
        }
        checkedTasks.each(function() {
            let taskElement = $(this).closest('.task');
            let taskText = taskElement.find('span').first().text();
            let studentName = taskElement.closest('[id$="-task-details"]').attr('id').replace('-task-details', '');
            // Remove the task from tasksByTeammate for the associated student
            if (tasksByTeammate[studentName]) {
                tasksByTeammate[studentName] = tasksByTeammate[studentName].filter(function(taskObj) {
                    return taskObj.task !== taskText; // Remove task by matching its text
                });

                // If the student has no tasks left, optionally remove them from the list
                if (tasksByTeammate[studentName].length === 0) {
                    delete tasksByTeammate[studentName];
                    removeStudent(studentName);
                    }
                }
                taskElement.remove();
        });
        saveClearedState(tasksByTeammate);
    });

    resetButton.click(function() {
        let confirm = window.confirm("Are you sure you want to reset all teammates and to-do items?");
        if (confirm) {
            let taskDetailsContainer = $("#task-details-container");
            dropdown.empty();
            taskDetailsContainer.empty();
            dropdown.prepend('<option value="" selected>Assign to</option>');
            tasksByTeammate = {};
            temmatesList = [];
            dropdownNames = [];
            taskInput.val("");
            dateInput.val("");
            defaultTaskView();
            resetDataOnServer();
        }
        else {
            return;
        }
    });

    function removeStudent(name) {
        let studentContainer = $(`#${name}-task-details`);
        studentContainer.remove();
        temmatesList = temmatesList.filter(student => student !== name);
        // saveTemmatesList(temmatesList);
    }

    function addStudentTittle(name) {
        let taskDetailsContainer = $("#task-details-container");

        if (!temmatesList.includes(name)) {
            temmatesList.push(name);
        }
        // saveTemmatesList(temmatesList);
        temmatesList.sort(function(a, b) {
            return a.localeCompare(b);
        });

        temmatesList.forEach(function(studentName) {
            let studentContainer = $(`#${studentName}-task-details`);
            if (studentContainer.length === 0) {
                let newDiv = $(`<div id="${studentName}-task-details">`);
                let studentTittle = $(`<span id="${studentName}">`).addClass("student-tittle").text(studentName);
                newDiv.append(studentTittle);
                taskDetailsContainer.append(newDiv);
            } 
            else {
                taskDetailsContainer.append(studentContainer);
            }
        });

    }

    function defaultTaskView() {
        let taskDetailsContainer = $("#task-details-container");
        let newSpan = $('<span>').addClass("no-tasks").text("No tasks right now please add a teammate and a task");
        taskDetailsContainer.append(newSpan);
        flag = true;
    }

    function addTask(name, task, date) {
        let taskDetails= $(`#${name}-task-details`);
        // Create list
        if (!tasksByTeammate[name]) {
            tasksByTeammate[name] = [];
        }
        tasksByTeammate[name].push({ task, date: new Date(date) });
        console.log("tasksByTeammate before saving", tasksByTeammate)
        saveTasksByTeammate(tasksByTeammate);
        tasksByTeammate[name].sort(function(a, b) {
            return a.date - b.date;
        });
        taskDetails.find('.task').remove();
        tasksByTeammate[name].forEach(function(taskObj) {
            let newTask = $('<div>').addClass("task");
            let taskSpan = $('<span>').text(taskObj.task);
            let newDiv = $('<div>');
            let dateSpan = $('<span>').addClass("due-date").text(`Due: ${taskObj.date.toLocaleDateString()}`);
            let checkbox = $('<input>').attr('type', 'checkbox');
            checkbox.change(function() {
                // console.log("Checkbox change event fired");
                if (this.checked) {
                    newTask.addClass("completed");
                } 
                else {
                    newTask.removeClass("completed");
                }
            });
            // console.log("Event handler attached to checkbox:", checkbox);
            newDiv.append(dateSpan, checkbox);
            newTask.append(taskSpan, newDiv);
            taskDetails.append(newTask);});
    }

});
 