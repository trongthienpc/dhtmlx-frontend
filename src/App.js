import React, { Component } from 'react';
import Gantt from './components/Gantt';
import Toolbar from './components/Toolbar';
import MessageArea from './components/MessageArea';
import Moment from 'react-moment';
import 'moment-timezone';
import moment from 'moment';
import { gantt } from 'dhtmlx-gantt';
import './App.css';


const data = {
  data: [],
  links: []
}
const data1 = {
  data: [],
  links: []
}

const getData = async () => {
  localStorage.removeItem("data")
  const api = await fetch("http://localhost:1337/data/")
    .then((response) => { return response.text() })
    .then(data => {
      localStorage.setItem("data", data)
      return data
    })
  return api
}

const logDataUpdate = async (type, action, item, id, parent) => {

  switch (action) {
    case "create":
      const createOptions = {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item)
      }
      await fetch("http://localhost:1337/data/task", createOptions)
      break;
    case "delete":
      const deleteOptions = {
        method: 'DELETE',
      }
      await fetch(`http://localhost:1337/data/task/${id}`, deleteOptions)
      break;

    default:
      break;
  }
  if (action === 'create') {
    const reqOptions = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item)
    }
    await fetch("http://localhost:1337/data/task", reqOptions).then(() => getData())
  }
}


const dataJson = JSON.parse(localStorage.getItem("data"))
data.data = dataJson ? dataJson.data : []
console.log(getData());
data.data.forEach(element => {
  const start_date = moment(element.start_date).format("YYYY-MM-DD hh:mm:ss")
  element.start_date = start_date
});
// console.log(dataJson.data)
class App extends Component {
  state = {
    currentZoom: 'Days',
    messages: []
  };


  addMessage(message) {
    const maxLogLength = 5;
    const newMessage = { message };
    const messages = [
      newMessage,
      ...this.state.messages
    ];

    if (messages.length > maxLogLength) {
      messages.length = maxLogLength;
    }
    this.setState({ messages });
  }

  logDataUpdate = (type, action, item, id, parent) => {
    let text = item && item.parent ? ` (${item.parent})` : '';
    let message = `${type} ${action}: ${id} ${text}`;
    if (type === 'link' && action !== 'delete') {
      message += ` ( source: ${item.source}, target: ${item.target} )`;
    }
    this.addMessage(message);
  }

  handleZoomChange = (zoom) => {
    this.setState({
      currentZoom: zoom
    });
  }

  render() {
    const { currentZoom, messages } = this.state;
    return (
      <div>
        <div className="zoom-bar">
          <Toolbar
            zoom={currentZoom}
            onZoomChange={this.handleZoomChange}
          />
        </div>
        <div className="gantt-container">
          <Gantt
            tasks={data}
            zoom={currentZoom}
            onDataUpdated={logDataUpdate}

          />
        </div>

      </div>
    );
  }
}

export default App;
