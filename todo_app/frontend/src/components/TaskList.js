import React from "react";
import Datetime from './Datetime';
import Tasks from './Tasks';

class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        user: localStorage.getItem('user'),
        title: "",
        completed: false,
        date_finished: new Date().toISOString()
      },
      editing: false,
    };
    this.fetchTasks = this.fetchTasks.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getCookie = this.getCookie.bind(this);

    this.startEdit = this.startEdit.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.strikeUnstrike = this.strikeUnstrike.bind(this);
  }

  updateDate = (value) => {
      value = value.toISOString();
      this.setState({
        activeItem: {
          ...this.state.activeItem,
          date_finished: value,
        },
      });;
      console.log(this.state.activeItem);
  }

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  componentDidMount() {
    this.fetchTasks();
    console.log(this.state.todoList);
  }

  fetchTasks() {
    console.log("Fetching...");
    fetch("http://localhost:8000/backend/task-list/", {
      method: "GET",
      headers: {
        "Authorization": `JWT ${localStorage.getItem('token')}`
      },
    })
    .then(response => response.json())
    .then(data =>
      this.setState({
        todoList:data
      })
    )
  }

  handleChange(e) {
    var name = e.target.name;
    var value = e.target.value;
    console.log("Name:", name);
    console.log("Value:", value);

    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value,
      },
    });
    console.log(this.state.activeItem, "on change");
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log("ITEM:", this.state.activeItem);

    var csrftoken = this.getCookie("csrftoken");

    var url = "http://localhost:8000/backend/task-create/";

    if (this.state.editing === true) {
      url = `http://localhost:8000/backend/task-update/${this.state.activeItem.id}/`;
      this.setState({
        editing: false,
      });
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
        "Authorization": `JWT ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(this.state.activeItem),
    })
      .then((response) => {
        this.fetchTasks();
        this.setState({
          activeItem: {
            id: null,
            title: "",
            user: localStorage.getItem('user'),
            completed: false,
            date_finished: new Date().toISOString(),
          },
        });
      })
      .catch(function (error) {
        console.log("ERROR:", error);
      });
  }

  startEdit(task) {
    this.setState({
      activeItem: task,
      editing: true,
    });
  }

  deleteItem(task) {
    var csrftoken = this.getCookie("csrftoken");

    fetch(`http://localhost:8000/backend/task-delete/${task.id}/`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
        "Authorization": `JWT ${localStorage.getItem('token')}`,
      },
    }).then((response) => {
      this.fetchTasks();
    });
  }

  strikeUnstrike(task) {
    task.completed = !task.completed;
    var csrftoken = this.getCookie("csrftoken");
    var url = `http://localhost:8000/backend/task-update/${task.id}/`;
    console.log(task);

    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
        "Authorization": `JWT ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(task),
    }).then(() => {
      this.fetchTasks();
    });

    console.log("TASK:", task.completed);
  }

  render() {
    var tasks = this.state.todoList;
    var self = this;
    return (
      <div className="container">
        <div id="task-container">
          <div id="form-wrapper">
            <form onSubmit={this.handleSubmit} id="form">
              <div className="flex-wrapper">
                <div style={{ flex: 5 }}>
                  <input
                    onChange={this.handleChange}
                    className="form-control"
                    id="title"
                    value={this.state.activeItem.title}
                    type="text"
                    name="title"
                    placeholder="Add task.."
                  />
                </div>
                <div style={{ flex: 1 }}>
                    <Datetime updateDate={this.updateDate}/>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    id="submit"
                    className="btn btn-warning"
                    type="submit"
                    name="Add"
                  />
                </div>
              </div>
            </form>
          </div>

          <div id="list-wrapper">
            {tasks.map(function (task, index) {
              return (
                <div key={index} className="task-wrapper flex-wrapper">
                  <div
                    onClick={() => self.strikeUnstrike(task)}
                    style={{ flex: 3}}
                  >
                    {task.completed === false ? (
                      <span>{task.title}</span>
                    ) : (
                      <strike>{task.title}</strike>
                    )}
                  </div>
                  <div style={{ flex: 3 }}>
                  <span>{task.date_finished}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <button
                      onClick={() => self.startEdit(task)}
                      className="btn btn-sm btn-outline-info"
                    >
                      Edit
                    </button>
                  </div>

                  <div style={{ flex: 1 }}>
                    <button
                      onClick={() => self.deleteItem(task)}
                      className="btn btn-sm btn-outline-dark delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default TaskList;
