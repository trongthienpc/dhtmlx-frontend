import React, { useState, useEffect } from "react";
import Gantt from "./components/Gantt";
import Toolbar from "./components/Toolbar";
import moment from "moment";

const App = () => {
  const refreshSource = () => {
    const dataJson = JSON.parse(localStorage.getItem("data"));
    const sources = {
      data: [],
      links: [],
    };
    sources.data = dataJson ? dataJson.data : [];
    sources.data.forEach((element) => {
      const start_date = moment(element.start_date).format(
        "YYYY-MM-DD hh:mm:ss"
      );
      element.start_date = start_date;
    });
    return sources;
  };
  const [sources, setSources] = useState(() => {
    const sources = refreshSource();
    console.log("Sources: ===>", sources);
    return sources;
  });

  const [status, setStatus] = useState(false);
  console.log("status: ", status);
  useEffect(() => {
    console.log("call useEffect");
    const getData = async () => {
      const api = await fetch("http://localhost:1337/data/")
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          localStorage.setItem("data", data);
          return data;
        });
      return api;
    };
    getData();
  }, [status]);

  const [currentZoom, setCurrentZoom] = useState("Days");
  const handleZoomChange = (zoom) => {
    setCurrentZoom(zoom);
  };

  const deleteTask = async (id) => {
    const options = {
      method: "DELETE",
    };
    await fetch(`http://localhost:1337/data/task/${id}`, options);
  };

  const createTask = async (task) => {
    const options = {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    };

    await fetch("http://localhost:1337/data/task", options)
      .then((response) => {
        return response.text();
      })
      .then((data) => console.log(data));
    setStatus(() => {
      return !status;
    });
  };

  const logDataUpdate = async (type, action, item, id, parent) => {
    switch (action) {
      case "create":
        console.log("create");
        createTask(item);

        break;

      case "delete":
        console.log("delete");
        deleteTask(id);
        break;
      default:
        break;
    }
  };
  return (
    <div>
      <div className="zoom-bar">
        <Toolbar zoom={currentZoom} onZoomChange={handleZoomChange} />
      </div>
      <div className="gantt-container">
        <Gantt
          tasks={sources}
          zoom={currentZoom}
          onDataUpdated={logDataUpdate}
        />
      </div>
    </div>
  );
};

export default App;
