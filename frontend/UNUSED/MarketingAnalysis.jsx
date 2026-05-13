import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Alert } from "react-bootstrap";

function MarketingAnalysis({ bookText, onRun }) {
  const [genre, setGenre] = useState("");
  const [audience, setAudience] = useState("");
  const [vibe, setVibe] = useState("");

  function buildPrompt() {
    return [
      "Provide a concise marketing analysis for this book.",
      genre && `Genre: ${genre}`,
      audience && `Target audience: ${audience}`,
      vibe && `Tone/vibes: ${vibe}`,
      "Return: 1) Hook/logline 2) 3 audience personas 3) 5 marketing angles 4) Comparable titles.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  const disabled = !bookText.trim();

  return (
    <Card className="p-4 shadow-sm border-0">
      <h4 className="mb-3">Marketing Analysis</h4>

      <Form>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-semibold">Genre</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Fantasy"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-semibold">Target Audience</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Young Adults"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-semibold">Tone / Vibes</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Romance, Dark Comedy"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="text-end">
          <Button
            variant="success"
            onClick={() => onRun(buildPrompt())}
            disabled={disabled}
          >
            Generate Marketing Plan
          </Button>
        </div>
      </Form>

      {disabled && (
        <Alert
          variant="info"
          className="mt-3 py-2 small text-center"
        >
          Upload a book in the <strong>Summarizer</strong> tab to enable this feature.
        </Alert>
      )}
    </Card>
  );
}

export default MarketingAnalysis;
