import React, { useState, useEffect } from "react";
import Gantt from "./components/Gantt";
import Toolbar from "./components/Toolbar";
import moment from "moment";

const App = () => {
  const refreshSource = () => {
    const dataJson = JSON.parse(localStorage.getItem("data"));
    const data = {
      data: [],
      links: [],
    };
    data.data = dataJson ? dataJson.data : [];
    data.data.forEach((element) => {
      const start_date = moment(element.start_date).format(
        "YYYY-MM-DD hh:mm:ss"
      );
      element.start_date = start_date;
    });
    return data;
  };
  const [sources, setSources] = useState(() => {
    const data = refreshSource();
    console.log("data", data);
    return data;
  });
  const getData = async () => {
    //   localStorage.removeItem("data");
    const api = await fetch("http://localhost:1337/data/")
      .then((response) => {
        return response.text();
      })
      .then((res) => {
        localStorage.setItem("data", res);
        setSources(() => {
          return JSON.parse(res);
        });
        return res;
      });
    return api;
  };

  useEffect(() => {
    const getData = async () => {
      //   localStorage.removeItem("data");
      const api = await fetch("http://localhost:1337/data/")
        .then((response) => {
          return response.text();
        })
        .then((res) => {
          localStorage.setItem("data", res);
          setSources(() => {
            return JSON.parse(res);
          });
          return res;
        });
      return api;
    };
    getData();
  }, []);

  console.log("++++++++++++++");
  console.log(sources.data);

  //   const currentZoom = "Days";
  const [currentZoom, setCurrentZoom] = useState("Days");
  const handleZoomChange = (zoom) => {
    setCurrentZoom(zoom);
  };

  const logDataUpdate = async (type, action, item, id, parent) => {
    switch (action) {
      case "create":
        console.log("create ======>");
        console.log(item);
        const createOptions = {
          method: "POST",
          mode: "cors",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(item),
        };
        await fetch("http://localhost:1337/data/task", createOptions).then(
          () => {
            setSources((prev) => {
              const newSource = getData();
              return newSource;
            });
          }
        );

        break;
      case "delete":
        const deleteOptions = {
          method: "DELETE",
        };
        await fetch(
          `http://localhost:1337/data/task/${id}`,
          deleteOptions
        ).then(() => {
          setSources(() => {
            const newSource = getData();
            return newSource;
          });
        });
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
