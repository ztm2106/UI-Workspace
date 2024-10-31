from flask import Flask
from flask import render_template
from flask import Response, request, jsonify

# Create a new Flask application instance
app = Flask(__name__)

# Initialize a global variable to track the current announcement ID
current_id = 2

# Sample data for announcements
announcements_data = [
    {
        "id": 1,
        "subject": "Announcement 1",
        "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam metus felis, ultrices a vulputate sed, eleifend in eros. Sed varius faucibus nisi, eget consectetur dui tristique id."
    },
    {
        "id": 2,
        "subject": "Announcement 2",
        "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam metus felis, ultrices a vulputate sed, eleifend in eros. Sed varius faucibus nisi, eget consectetur dui tristique id."
    },
]

# Sample data for todo lists
todo_list_data = [
    {
        "name": "Zakiy",
        "task": ["AI HW 2", "Finish HW 3, Do Laundry"],
        "completed": [True, False],
        "date": ["10/23/2024", "11/1/2024", "10/20/24"]
    },
    {
        "name": "Alex",
        "task": ["Visit Mom", "Football Practice", "Gym", "BDay"],
        "completed": [True, False],
        "date": ["10/28/2024", "11/20/2024", "11/09/24", "11/09/24"]
    },
]

# API endpoint to get the todo list data
@app.route('/api/todo', methods=['GET'])
def api_todo():
    return jsonify(todo_list_data)

# API endpoint to get all announcements
@app.route('/api/announcements', methods=['GET'])
def api_announcements():
    return jsonify(announcements_data)

# API endpoint to get a specific announcement by its index
@app.route('/api/announcements/<int:index>', methods=['GET'])
def api_announcement_by_index(index):
    # Check if the index is valid
    if 0 <= index < len(announcements_data):
        return jsonify(announcements_data[index])
    else:
        return jsonify({'error': 'Index out of range'}), 404

# Route for the homepage rendering the todo list
@app.route('/')
def hello_world():
    return render_template('ZakiyManigo_TodoList.html', data=todo_list_data) 

# Route for rendering the announcements page
@app.route('/announcements')
def announcements(name=None):
    return render_template('announcements.html', data=announcements_data)

# API endpoint to get completed tasks
@app.route('/api/todo/completed', methods=['GET'])
def api_todo_completed():
    completed_tasks = []

    # Iterate through each teammate's todo list
    for teammate in todo_list_data:
        name = teammate['name']
        tasks = teammate.get('task', [])
        dates = teammate.get('date', [])
        completed_flags = teammate.get('completed', [])

        # Collect completed tasks
        for i in range(len(tasks)):
            if completed_flags[i]:
                completed_task = {
                    'name': name,
                    'task': tasks[i],
                    'date': dates[i],
                    'completed': completed_flags[i]
                }
                completed_tasks.append(completed_task)

    return jsonify(completed_tasks)

# API endpoint to add a new teammate
@app.route('/add_teammate', methods=['GET', 'POST'])
def add_teammate():
    global todo_list_data

    # Get JSON data from the request
    json_data = request.get_json()
    name = json_data["name"]
    task = json_data["task"]
    completed = json_data["completed"]
    date = json_data["date"]

    # Create a new teammate entry
    new_name = {
        "name": name,
        "task": task,
        "completed": completed,
        "date": date
    }

    # Append the new teammate to the todo list data
    todo_list_data.append(new_name)

    return jsonify(data=todo_list_data)

# API endpoint to add a task to a teammate's list
@app.route('/add_task', methods=['GET', 'POST'])
def add_task():
    global todo_list_data

    # Get JSON data from the request
    json_data = request.get_json()
    print("Received data:", json_data)
    name = json_data["name"]
    task = json_data["task"]
    completed = json_data["completed"]
    date = json_data["date"]

    # Find the teammate by name and add the task
    for item in todo_list_data:
        if item["name"] == name:
            # Ensure task, date, and completed lists are initialized
            if not item["task"] or not item["date"] or not item["completed"]:
                item["task"] = []
                item["date"] = []
                item["completed"] = []
            print("Before", item["task"], item["date"], item["completed"])
            item["task"].append(task)
            item["date"].append(date)
            item["completed"].append(bool(completed))
            print(item["task"], item["date"], item["completed"])
            break

    return jsonify(data=todo_list_data)

# API endpoint to update the status of a task
@app.route('/update_task_status', methods=['POST'])
def update_task_status():
    global todo_list_data
    json_data = request.get_json()
    name = json_data["name"]
    task = json_data["task"]
    date = json_data["date"]
    completed = json_data["completed"]

    # Find the teammate and update the task status
    for item in todo_list_data:
        if item["name"] == name:
            if item["task"]:
                for idx, t in enumerate(item["task"]):
                    if t == task and item["date"][idx] == date:
                        item["completed"][idx] = bool(completed)  # Update completion status
                        break
            break

    return jsonify(data=todo_list_data)

# API endpoint to update the entire list of tasks
@app.route('/update_tasks', methods=['POST'])
def update_tasks():
    global todo_list_data
    json_data = request.get_json()
    print("Received data:", json_data)

    # Directly assign the new data to todo_list_data
    todo_list_data = json_data

    return jsonify(data=todo_list_data)

# API endpoint to reset the todo data
@app.route('/reset_data', methods=['POST'])
def reset_data():
    global todo_list_data
    # Reset the todo list to an empty list
    todo_list_data = []
    print("Data has been reset.")

    return jsonify(success=True)

# API endpoint to post a new announcement
@app.route('/post_announcement', methods=['GET', 'POST'])
def post_announcement():
    global announcements_data
    global current_id

    # Get JSON data from the request
    json_data = request.get_json()
    subject = json_data["subject"]
    body = json_data["body"]

    # Create a new announcement entry
    current_id += 1
    new_announcement = {
        "id": current_id,
        "subject": subject,
        "body": body
    }
    announcements_data.append(new_announcement)

    # Return the updated announcements data
    return jsonify(data=announcements_data)

# Route to say hello to a user
@app.route('/hello/<name>')
def hello(name=None):
    return render_template('hello.html', name=name) 

# Run the Flask app in debug mode
if __name__ == '__main__':
   app.run(debug=True)
