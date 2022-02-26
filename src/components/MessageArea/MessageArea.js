import React from "react";
import moment from "moment";
import "./MessageArea.css";
import { Col, Container, Row } from "react-bootstrap";

const MessageArea = ({ messages, books }) => {
  var total = 0;
  if (messages) total = messages.length;
  return (
    <div>
      <Container>
        <Row className="row">
          <Col className="col">
            <div className="message-area">
              <h3>Customers: {total}</h3>
              <ul>
                {messages.map((message, index) => (
                  <li key={index}>
                    {message.text} -{" "}
                    {moment(message.start_date).format("DD/MM/YYYY")} -{" "}
                    {message.duration} night(s)
                  </li>
                ))}
              </ul>
            </div>
          </Col>
          <Col>
            <div className="message-area">
              <h3>Book on next 7 days: {books.length} bookings</h3>
              <ul>
                {books.map((book, index) => (
                  <li key={index}>
                    {book.text} - {moment(book.start_date).format("DD/MM/YYYY")}{" "}
                    - {book.duration} night(s)
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MessageArea;
