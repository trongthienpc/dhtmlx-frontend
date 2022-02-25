import React, { useState, useEffect, useLayoutEffect } from "react";
import Gantt from "./components/Gantt";
import Toolbar from "./components/Toolbar";
import moment from "moment";
import MessageArea from "./components/MessageArea/MessageArea";
import { gantt } from "dhtmlx-gantt";
import { URL_API } from "./utilities/constants";
const App = () => {
  // messages
  const [message, setMessage] = useState();
  const [messages, setMessages] = useState([]);
  const [entity, setEntity] = useState({});
  const [parent, setParent] = useState("");
  console.log(messages);

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
  const handleAction = () => {
    setStatus(!status);
  };

  const updateLocal = async () => {
    const api = await fetch(`${URL_API}/data`)
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        localStorage.setItem("data", data);
      });
    return api;
  };

  useEffect(() => {
    console.log("call useEffect");
    localStorage.removeItem("data");
    const getData = async () => {
      const api = await fetch(`${URL_API}/data/`)
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          localStorage.setItem("data", data);
        });
      return api;
    };
    getData();
  }, []);

  const [filter, setFiler] = useState("henry");

  // useEffect(() => {
  //   const onBeforeTaskDisplay = gantt.attachEvent(
  //     "onBeforeTaskDisplay",
  //     function (id, task) {
  //       console.log("filters", task.text, filter);
  //       if (filter === task.text) {
  //         return false;
  //       }
  //       return true;
  //     }
  //   );
  //   gantt.refreshData();
  //   gantt.render();

  //   // This should have been here
  //   return () => {
  //     gantt.detachEvent(onBeforeTaskDisplay);
  //   };
  // }, [filter]);
  // const handleChange = (e) => {
  //   setFiler({
  //     [e.target.name]: e.target.value,
  //   });
  // };

  console.log("status: ", status);

  const [currentZoom, setCurrentZoom] = useState("Days");
  const handleZoomChange = (zoom) => {
    setCurrentZoom(zoom);
  };

  const deleteTask = async (id) => {
    const options = {
      method: "DELETE",
    };
    await fetch(`${URL_API}/data/task/${id}`, options);
    await updateLocal();
  };

  const createTask = async (task) => {
    console.log(task);
    const options = {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    };

    await fetch(`${URL_API}/data/task`, options).then((response) => {
      return response.text();
    });
    await updateLocal();
  };

  const updateTask = async (task, id) => {
    const options = {
      method: "PUT",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    };

    await fetch(`${URL_API}/data/task/${id}`, options).then((response) => {
      return response.text();
    });
    await updateLocal();
  };

  const getTaskById = async (id) => {
    const options = {
      method: "GET",
    };

    const task = await fetch(`${URL_API}/data/task/${id}`, options)
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        const dataJson = JSON.parse(data);
        setEntity(() => {
          return dataJson.tid;
        });
      });
    return task;
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
      case "update":
        console.log("update");
        updateTask(item, id);
        break;
      default:
        break;
    }

    setMessages((prev) => {
      let message = `${action} ${id}`;
      return [...prev, message];
    });
  };

  // gantt.attachEvent("onTaskClick", function (id, e) {
  //   //   // await getTaskById(id);
  //   console.log("Task click ........");
  //   return true;
  // });
  // gantt.attachEvent(
  //   "onTaskClick",
  //   function (id, e) {
  //     console.log("onTaskClick");
  //   },
  //   { id: "ggg" }
  // );

  // gantt.attachEvent(
  //   "onTaskRowClick",
  //   function (id, row) {
  //     console.log("onTaskClick", id);
  //   },
  //   { id: "r1" }
  // );

  gantt.attachEvent(
    "onTaskSelected",
    async function (id) {
      const childrens = await fetch(`${URL_API}/data/task/child/${id}`)
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          const dataJson = JSON.parse(data);
          return dataJson.tid;
        });
      console.log(childrens);
      setMessages(() => {
        return childrens;
      });
      return childrens;
    },
    { id: "banana" }
  );

  function change_detector() {
    console.log("call mee ------");
  }

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
      <div>
        <MessageArea messages={messages} />
      </div>
    </div>
  );
};

export default App;
