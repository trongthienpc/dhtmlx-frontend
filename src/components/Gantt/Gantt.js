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
    // gantt.config.layout = {
    //   css: "gantt_container",
    //   rows: [
    //     {
    //       cols: [
    //         { view: "grid", group: "grids", scrollY: "scrollVer" },
    //         { resizer: true, width: 3 },
    //         { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
    //         { view: "scrollbar", id: "scrollVer", group: "vertical" }
    //       ],
    //       gravity: 2
    //     },
    //     { view: "scrollbar", scroll: "x", id: "scrollHor", height: 20 }
    //   ]
    // };
    gantt.templates.grid_row_class = function (start, end, task) {
      if (task.$level >= 1) {
        return "nested_task";
      }
      return "";
    };

    // gantt.config.columns = [
    //   {
    //     name: "text",
    //     label: "Task name",
    //     tree: true,
    //     min_width: 150,
    //     max_width: 300,
    //   },
    //   { name: "start_date", label: "Start time", align: "center", width: 120 },
    //   { name: "end_date", label: "End date", align: "center", width: 120 },
    //   { name: "add", label: "+", align: "center", width: 50 },
    // ];

    // gantt.locale.labels.section_priority = "Priority";
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
      // {
      //   name: "status",
      //   height: 22,
      //   map_to: "status",
      //   type: "select",
      //   options: [
      //     { key: 1, label: "New" },
      //     { key: 2, label: "Open" },
      //     { key: 3, label: "Done" },
      //   ],
      // },
      {
        name: "phone",
        map_to: "phone",
        type: "textarea",
        height: 23,
      },
      { name: "time", height: 72, type: "duration", map_to: "auto" },
    ];
    const { tasks } = this.props;
    gantt.init(this.ganttContainer);
    this.initGanttDataProcessor();
    gantt.parse(tasks);
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
