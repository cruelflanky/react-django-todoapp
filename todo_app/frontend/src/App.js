import React, { Component } from 'react';
import Nav from './components/Nav';
import Login from './components/Login';
import Signup from './components/Signup';
import TaskList from './components/TaskList';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayed_form: '',
      logged_in: localStorage.getItem('token') ? true : false,
      username: '',
    };
  }

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

  componentDidMount() {
    if (this.state.logged_in) {
      fetch('http://localhost:8000/backend/current_user/', {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(json => {
          this.setState({
              username: json.username,
            });
        });
    }
  }

  handle_login = (e, data) => {
    e.preventDefault();
    fetch('http://localhost:8000/token-auth/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(json => {
        console.log(json);
        localStorage.setItem('token', json.token);
        localStorage.setItem('user', json.user.pk);
        this.setState({
          logged_in: true,
          displayed_form: '',
          username: json.user.username,
        });
      });
  };

  handle_signup = (e, data) => {
    e.preventDefault();
    fetch('http://localhost:8000/backend/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(json => {
        console.log(json);
        localStorage.setItem('token', json.token);
        localStorage.setItem('user', json.pk);
        this.setState({
          logged_in: true,
          displayed_form: '',
          username: json.username,
        });
      });
  };

  handle_logout = () => {
    localStorage.removeItem('token');
    this.setState({ logged_in: false, username: '' });
  };

  display_form = form => {
    this.setState({
      displayed_form: form
    });
  };

  render() {
    let form;
    switch (this.state.displayed_form) {
      case 'login':
        form = <Login handle_login={this.handle_login} />;
        break;
      case 'signup':
        form = <Signup handle_signup={this.handle_signup} />;
        break;
      default:
        form = null;
    }
    let content;
    if (this.state.logged_in) {
        console.log(localStorage.getItem('user'), "user pk");
        content = <TaskList />;
    } else {
        content = <h3>Please Log In</h3>;
    }

    return (
        <div className="grid">
            <Nav
            logged_in={this.state.logged_in}
            display_form={this.display_form}
            handle_logout={this.handle_logout}
            />,
            {form},
            {content}
        </div>
    );
  }
}

export default App;
