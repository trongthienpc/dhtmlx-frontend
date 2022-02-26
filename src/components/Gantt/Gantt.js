import React, { Component } from "react";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";

export default class Gantt extends Component {
  // instance of gantt.dataProcessor
  dataProcessor = null;

  initZoom() {
    gantt.ext.zoom.init({
      levels: [
        {
          name: "Days",
          scale_height: 60,
          min_column_width: 70,
          scales: [
            { unit: "week", step: 1, format: "Week #%W" },
            { unit: "day", step: 1, format: "%d %M" },
          ],
        },
        {
          name: "Months",
          scale_height: 60,
          min_column_width: 70,
          scales: [
            { unit: "month", step: 1, format: "%F" },
            { unit: "week", step: 1, format: "#%W" },
          ],
        },
      ],
    });
  }

  setZoom(value) {
    if (!gantt.$initialized) {
      this.initZoom();
    }
    gantt.ext.zoom.setLevel(value);
  }

  initGanttDataProcessor() {
    /**
     * type: "task"|"link"
     * action: "create"|"update"|"delete"
     * item: data object object
     */
    const onDataUpdated = this.props.onDataUpdated;
    this.dataProcessor = gantt.createDataProcessor(
      (type, action, item, id, parent) => {
        return new Promise((resolve, reject) => {
          if (onDataUpdated) {
            onDataUpdated(type, action, item, id, parent);
          }

          // if onDataUpdated changes returns a permanent id of the created item, you can return it from here so dhtmlxGantt could apply it
          // resolve({id: databaseId});
          return resolve();
        });
      }
    );
  }

  shouldComponentUpdate(nextProps) {
    return this.props.zoom !== nextProps.zoom;
  }

  componentDidMount() {
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.scroll_size = 20;

    gantt.templates.grid_row_class = function (start, end, task) {
      if (task.$level >= 1) {
        return "nested_task";
      }
      return "";
    };

    gantt.locale.labels.section_phone = "Phone/Email";
    gantt.locale.labels.section_description = "Name";
    gantt.config.lightbox.sections = [
      {
        name: "description",
        height: 23,
        map_to: "text",
        type: "textarea",
        focus: true,
      },

      {
        name: "phone",
        map_to: "phone",
        type: "textarea",
        height: 23,
      },
      // { name: "time", height: 72, type: "duration", map_to: "auto" },
      {
        name: "time",
        type: "duration",
        map_to: "auto",
      },
    ];

    gantt.config.columns = [
      {
        name: "text",
        label:
          "<div class='searchEl'>Name <input id='search' type='text'" +
          "oninput='gantt.change_detector()' placeholder='Search tasks...'> </div>",
        width: 200,
        tree: true,
        resize: true,
      },
      {
        name: "start_date",
        label: "Start time",
        align: "center",
        format: "dd-mm-YY",
      },
      { name: "duration", label: "Duration", align: "center" },
      { name: "add", label: "", width: 50, align: "left" },
    ];

    gantt.templates.time_picker = function (date) {
      return gantt.date.date_to_str(gantt.config.time_picker)(date);
    };

    // Highlighting weekends
    // gantt.config.work_time = true;

    // gantt.templates.scale_cell_class = function (date) {
    //   if (!gantt.isWorkTime(date)) {
    //     return "weekend";
    //   }
    // };
    // gantt.templates.timeline_cell_class = function (task, date) {
    //   if (!gantt.isWorkTime({ task: task, date: date })) {
    //     return "weekend";
    //   }
    // };
    gantt.templates.scale_cell_class = function (date) {
      if (date.getDay() === 0 || date.getDay() === 6) {
        return "weekend";
      }
    };
    gantt.templates.timeline_cell_class = function (task, date) {
      if (date.getDay() === 0 || date.getDay() === 6) {
        return "weekend";
      }
    };

    gantt.templates.task_class = function (start, end, task) {
      if (task.parent == 0) return "parent";
    };

    gantt.config.open_tree_initially = true;
    const { tasks } = this.props;
    gantt.config.fit_tasks = true;
    gantt.plugins({
      tooltip: true,
    });
    gantt.templates.grid_date_format = function (date) {
      return gantt.date.date_to_str("%m-%d-%Y")(date);
    };
    gantt.init(this.ganttContainer, new Date());
    this.initGanttDataProcessor();
    gantt.parse(tasks);
    gantt.showDate(new Date());
    gantt.templates.tooltip_text = function (start, end, task) {
      return `<b>Name:</b>  ${task.text}  <br/><b>Phone:</b> ${task.phone}<br/><b>Duration:</b>   ${task.duration}`;
    };

    var filter_data = "";
    var search_box = document.getElementById("search");
    gantt.attachEvent("onDataRender", function () {
      search_box = document.getElementById("search");
    });

    gantt.change_detector = function change_detector() {
      filter_data = search_box.value;
      gantt.refreshData();
    };

    function compare_input(id) {
      var match = false;
      // check children's text
      if (gantt.hasChild(id)) {
        gantt.eachTask(function (child_object) {
          if (compare_input(child_object.id, filter_data)) {
            match = true;
          }
        }, id);
      }

      // check task's text
      if (
        gantt
          .getTask(id)
          .text.toLowerCase()
          .indexOf(filter_data.toLowerCase()) >= 0
      )
        match = true;
      return match;
    }

    gantt.attachEvent("onBeforeTaskDisplay", function (id, task) {
      if (compare_input(id)) {
        return true;
      }
      return false;
    });

    gantt.attachEvent("onTaskCreated", function (task) {
      task.start_date = new Date();
      return true;
    });

    gantt.change_detector();
  }

  componentWillUnmount() {
    if (this.dataProcessor) {
      this.dataProcessor.destructor();
      this.dataProcessor = null;
    }
  }

  render() {
    const { zoom } = this.props;
    this.setZoom(zoom);
    return (
      <div
        ref={(input) => {
          this.ganttContainer = input;
        }}
        style={{ width: "100%", height: "100%" }}
      ></div>
    );
  }
}
