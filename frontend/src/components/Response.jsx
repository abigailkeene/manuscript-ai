import React from "react";
import { Card, Spinner, Alert } from "react-bootstrap";

function Response({ loading, error, out }) {
  if (loading) {
    return (
      <Card className="p-4 shadow-sm border-0 text-center">
        <Spinner animation="border" role="status" className="me-2" />
        <span className="fw-semibold">Thinking…</span>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 shadow-sm border-0">
        <Alert variant="danger" className="mb-0">
          <strong>Error:</strong> {error}
        </Alert>
      </Card>
    );
  }

  if (!out) {
    return (
      <Card className="p-4 shadow-sm border-0 text-center text-muted">
        <span>Results will appear here after generation.</span>
      </Card>
    );
  }

  return (
    <Card className="p-4 shadow-sm border-0">
      <h5 className="mb-3 fw-semibold">AI Response</h5>
      <div className="response-body">
        {out.split("\n").map((line, i) => (
          <p key={i} className="mb-2">
            {line}
          </p>
        ))}
      </div>
    </Card>
  );
}

export default Response;
