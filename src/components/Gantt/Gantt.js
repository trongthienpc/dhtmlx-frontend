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
    //     label:
    //       "<input id='search' type='field' oninput=change_detector() style='width:150px' />",
    //     tree: true,
    //     min_width: 200,
    //     max_width: 300,
    //   },
    //   { name: "start_date", label: "Start time", align: "center", width: 120 },
    //   { name: "duration", label: "Duration", align: "center", width: 120 },
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

    // Search bar + functionality
    // var textFilter =
    //   "<input id='search' placeholder='Search...' type='text' oninput='gantt.$doFilter(this.value)'>";
    // var filterValue = "";
    // var delay;
    // gantt.$doFilter = function (value) {
    //   filterValue = value;
    //   clearTimeout(delay);
    //   delay = setTimeout(function () {
    //     gantt.render();
    //     gantt.$root.querySelector("#search").focus();
    //   }, 200);
    // };
    // gantt.attachEvent("onBeforeTaskDisplay", function (id, task) {
    //   if (!filterValue) return true;
    //   var normalizedText = task.text.toLowerCase();
    //   var normalizedValue = filterValue.toLowerCase();
    //   return normalizedText.indexOf(normalizedValue) > -1;
    // });
    // gantt.attachEvent("onGanttRender", function () {
    //   gantt.$root.querySelector("#search").value = filterValue;
    // });
    // End of search bar + functionality

    // Tree header (columns)
    // gantt.config.columns = [
    //   { name: "text", label: textFilter, tree: true, resize: true },
    //   { name: "start_date", label: "Start time", align: "center" },
    //   { name: "duration", label: "Duration", align: "center" },
    // ];
    gantt.config.columns = [
      { name: "add", label: "", width: 50, align: "left" },
      {
        name: "text",
        label:
          "<div class='searchEl'>Task name <input id='search' type='text'" +
          "oninput='gantt.change_detector()' placeholder='Search tasks...'> </div>",
        width: 250,
        tree: true,
      },
      // other columns
      // {
      //   name: "text",
      //   label: textFilter,
      //   tree: true,
      //   min_width: 200,
      //   max_width: 300,
      // },
    ];

    gantt.config.open_tree_initially = true;
    const { tasks } = this.props;
    gantt.init(this.ganttContainer);
    this.initGanttDataProcessor();
    gantt.parse(tasks);

    // var inputEl = document.getElementById("search");

    // inputEl.oninput = function () {
    //   gantt.refreshData();
    // };

    // function hasSubstr(parentId) {
    //   var task = gantt.getTask(parentId);
    //   if (task.text.toLowerCase().indexOf(inputEl.value.toLowerCase()) !== -1)
    //     return true;

    //   var child = gantt.getChildren(parentId);
    //   for (var i = 0; i < child.length; i++) {
    //     if (hasSubstr(child[i])) return true;
    //   }
    //   return false;
    // }

    // gantt.attachEvent("onBeforeTaskDisplay", function (id, task) {
    //   if (hasSubstr(id)) return true;

    //   return false;
    // });

    var filter_data = "";
    var search_box = document.getElementById("search");
    gantt.attachEvent("onDataRender", function () {
      search_box = document.getElementById("search");
    });

    // search_box.oninput = function change_detector() {
    //   console.log("filter_data", filter_data);
    //   filter_data = search_box.value;
    //   gantt.refreshData();
    // };

    gantt.change_detector = function change_detector() {
      filter_data = search_box.value;
      gantt.refreshData();
    };

    function compare_input(id) {
      var match = false;
      // check children's text
      if (gantt.hasChild(id)) {
        console.log("id", id);
        gantt.eachTask(function (child_object) {
          if (compare_input(child_object.id, filter_data)) {
            match = true;
            console.log("child_object", child_object.id);
            console.log("filter_data", filter_data);
          }
          console.log("match", match);
        }, id);
      }

      // check task's text
      // if (!filter_data) return (match = true);

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
