import React from 'react';
import TaskList from './TaskList';

function Tasks(props) {
    if (props.task){
        props.tasks.data.map(function (task, index) {
            return (
                <div key={index} className="task-wrapper flex-wrapper">
                <div
                    onClick={() => TaskList.strikeUnstrike(task)}
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
                    onClick={() => TaskList.startEdit(task)}
                    className="btn btn-sm btn-outline-info"
                    >
                    Edit
                    </button>
                </div>

                <div style={{ flex: 1 }}>
                    <button
                    onClick={() => TaskList.deleteItem(task)}
                    className="btn btn-sm btn-outline-dark delete"
                    >
                    Delete
                    </button>
                </div>
                </div>
            );
        })
    }
    return(<span>Empty list</span>);
}

export default Tasks;