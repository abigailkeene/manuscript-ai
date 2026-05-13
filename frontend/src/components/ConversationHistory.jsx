import React from "react";
import { Card, ListGroup, Badge } from "react-bootstrap";

function ConversationHistory({ history }) {
  return (
    <Card className="p-4 shadow-sm border-0">
      <h5 className="mb-3 fw-semibold text-secondary">Conversation History</h5>

      {history.length === 0 ? (
        <p className="text-muted small mb-0">No questions yet.</p>
      ) : (
        <ListGroup variant="flush">
          {[...history].reverse().map((entry, i) => (
            <ListGroup.Item key={i} className="py-3">
              <p className="mb-1">
                <Badge bg="dark" className="me-2">
                  Q
                </Badge>
                <strong>{entry.prompt}</strong>
              </p>
              <p className="mb-1">
                <Badge bg="info" text="dark" className="me-2">
                  A
                </Badge>
                {entry.response}
              </p>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card>
  );
}

export default ConversationHistory;
