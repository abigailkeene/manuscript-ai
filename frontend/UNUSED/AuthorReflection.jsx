import React from "react";
import { Card, Button, Form, Row, Col, Badge } from "react-bootstrap";

function AuthorReflection({ bookText, prompt, setPrompt, onRun }) {
  const REFLECTION_PROMPTS = [
    "What themes emerge most strongly in my book?",
    "How do my characters align with reader expectations for this genre?",
    "Where does the pacing feel slow or too fast?",
    "What scenes are most emotionally impactful and why?",
    "What’s a compelling logline/blurb for this story?",
  ];

  function handlePrePromptClick(p) {
    setPrompt(p);
  }

  return (
    <Card className="p-4 shadow-sm border-0">
      <h4 className="mb-3">Author Reflection</h4>

      {/* Pre-generated prompts */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Pre-Generated Prompts</Form.Label>
        <Row>
          {REFLECTION_PROMPTS.map((p) => (
            <Col key={p} xs={12} md={6} className="mb-2">
              <Button
                variant="outline-secondary"
                size="sm"
                className="w-100 text-start"
                onClick={() => handlePrePromptClick(p)}
                title="Click to load this prompt"
              >
                {p}
              </Button>
            </Col>
          ))}
        </Row>
      </Form.Group>

      {/* Custom prompt */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Custom Prompt</Form.Label>
        <Form.Control
          as="textarea"
          rows={5}
          placeholder="Write your own question here…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Form.Text className="text-muted">
          Type your own reflection question or click a pre-made one above.
        </Form.Text>
      </Form.Group>

      {/* Ask Button */}
      <div className="text-end">
        <Button
          variant="primary"
          disabled={!prompt.trim()}
          onClick={() => onRun(prompt)}
        >
          Ask
        </Button>
      </div>
    </Card>
  );
}

export default AuthorReflection;
