import React from "react";
import moment from "moment";

const MessageArea = ({ messages }) => {
  var total = 0;
  if (messages) total = messages.length;
  return (
    <div>
      <div className="message-area">
        <h3>Customers: {total}</h3>
        <ul>
          {messages.map((message, index) => (
            <li key={index}>
              {message.text} - {moment(message.start_date).format("DD/MM/YYYY")}{" "}
              - {message.duration} night(s)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MessageArea;
