from flask import Flask
from flask import render_template
from flask import Response, request, jsonify
app = Flask(__name__)

current_id = 2
announcements_data = [
    {
        "id": 1,
        "subject": "Announcement 1 Subject",
        "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam metus felis, ultrices a vulputate sed, eleifend in eros. Sed varius faucibus nisi, eget consectetur dui tristique id."
    },
    {
        "id": 2,
        "subject": "Announcement 2 Subject",
        "body": "Mauris et auctor turpis. Integer mollis pulvinar facilisis. Suspendisse vulputate finibus tempus. Praesent nec nibh sed lorem imperdiet porttitor volutpat quis lectus. Curabitur eu dapibus purus. Sed semper lacus nunc, ut hendrerit arcu porta eu. Morbi pulvinar nulla quis nisi scelerisque, vitae posuere dui rhoncus."
    },
]

todo_list_data = [
    {
        "name": "Juan",
        "task": ["Finish Homework 3","Finish Checkpoint 3"],
        "completed": [True, False],
        "date": ["10/30/2024", "11/30/2024"]
    },

    {
        "name": "Andrea",
        "task": ["Finish Homework 3","Finish Checkpoint 3"],
        "completed": [True, False],
        "date": ["10/30/2024", "11/30/2024"]
    },
]

@app.route('/api/announcements', methods=['GET'])
def api_announcements():
    return jsonify(announcements_data)

@app.route('/api/todo', methods=['GET'])
def api_todo():
    return jsonify(todo_list_data)

@app.route('/api/todo/completed', methods=['GET'])
def api_todo_completed():
    completed_tasks = []

    for teammate in todo_list_data:
        name = teammate['name']
        tasks = teammate.get('task', [])
        dates = teammate.get('date', [])
        completed_flags = teammate.get('completed', [])

        # Loop through the tasks and collect completed ones
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

@app.route('/api/announcements/<int:index>', methods=['GET'])
def api_announcement_by_index(index):
    if 0 <= index < len(announcements_data):
        return jsonify(announcements_data[index])
    else:
        return jsonify({'error': 'Index out of range'}), 404

@app.route('/')
def hello_world():
   return render_template('Todo_list.html', data=todo_list_data) 

@app.route('/hello/<name>')
def hello(name=None):
    return render_template('hello.html', name=name) 

@app.route('/announcements')
def announcements(name=None):
    return render_template('announcements.html', data=announcements_data)

@app.route('/add_teammate', methods=['GET', 'POST'])
def add_teammate():
    global todo_list_data

    json_data = request.get_json()
    name = json_data["name"]
    task = json_data["task"]
    completed = json_data["completed"]
    date = json_data["date"]

    new_name = {
        "name": name,
        "task": task,
        "completed": completed,
        "date":date
    }

    todo_list_data.append(new_name)

    return jsonify(data = todo_list_data)

@app.route('/add_task', methods=['GET', 'POST'])
def add_task():
    global todo_list_data

    json_data = request.get_json()
    print("Received data:", json_data)
    name = json_data["name"]
    task = json_data["task"]
    completed = json_data["completed"]
    date = json_data["date"]

    for item in todo_list_data:
        if item["name"] == name:
            if not item["task"] or not item["date"] or not item["completed"]:
                item["task"] = []
                item["date"] = []
                item["completed"] = []
            print("Before",item["task"], item["date"], item["completed"])
            item["task"].append(task)
            item["date"].append(date)
            item["completed"].append(bool(completed))
            print(item["task"], item["date"], item["completed"])
            break

    return jsonify(data = todo_list_data)

@app.route('/update_task_status', methods=['POST'])
def update_task_status():
    global todo_list_data
    json_data = request.get_json()
    name = json_data["name"]
    task = json_data["task"]
    date = json_data["date"]
    completed = json_data["completed"]

    for item in todo_list_data:
        if item["name"] == name:
            if item["task"]:
                for idx, t in enumerate(item["task"]):
                    if t == task and item["date"][idx] == date:
                        item["completed"][idx] = bool(completed)
                        break
            break

    return jsonify(data=todo_list_data)

@app.route('/update_tasks', methods=['POST'])
def update_tasks():
    global todo_list_data
    json_data = request.get_json()
    print("Received data:", json_data)

    # Directly assign the new data
    todo_list_data = json_data

    return jsonify(data=todo_list_data)

@app.route('/reset_data', methods=['POST'])
def reset_data():
    global todo_list_data
    # Reset the data to an empty list
    todo_list_data = []
    print("Data has been reset.")

    return jsonify(success=True)

@app.route('/post_announcement', methods=['GET', 'POST'])
def post_announcement():
    global announcements_data
    global current_id

    json_data = request.get_json()
    subject = json_data["subject"]
    body = json_data["body"]

    # Add new announcement entry to main 'data' array with
    # a new id and with the subject & body that the user sent in JSON
    # format via POST
    current_id += 1
    new_id = current_id
    new_announcement = {
        "id": current_id,
        "subject": subject,
        "body": body
    }
    announcements_data.append(new_announcement)

    # Send back the WHOLE array of data so the client can redisplay it
    return jsonify(data = announcements_data)

if __name__ == '__main__':
   app.run(debug = True)




