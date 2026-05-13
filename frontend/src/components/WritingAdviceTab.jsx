import React, { useState } from "react";
import {
  Container,
  Card,
  Button,
  Spinner,
  Form,
  Collapse,
  Row,
  Col,
} from "react-bootstrap";

// ✔ Personality settings
const PERSONALITIES = {
  direct:
    "Use a direct, blunt, highly honest tone. Do not soften criticism. Prioritize truth over comfort.",
  gentle:
    "Use a soft, encouraging, supportive tone. Phrase critiques gently and highlight strengths first.",
  academic:
    "Use a scholarly, analytical tone. Focus on structure, clarity, theory, and literary quality.",
  commercial:
    "Use an industry-focused professional tone discussing marketability, clarity, and audience expectations.",
};

function WritingAdviceTab({ onResponsesUpdate, personality }) {
  const [loadingState, setLoadingState] = useState({});
  const [responses, setResponses] = useState({});
  const [prompts, setPrompts] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [editPromptOpen, setEditPromptOpen] = useState({});

  const handlePromptChange = (i, val) => {
    setPrompts((prev) => ({ ...prev, [i]: val }));
  };

  const handleFeedback = async (i, topicPrompt, depth = "quick") => {
    setLoadingState((p) => ({ ...p, [i]: depth }));
    setResponses((p) => ({ ...p, [i]: "" }));

    const personalityModifier = PERSONALITIES[personality] || "";

    const promptToSend = `
You are a professional writing coach and literary analyst.
Your goal is to help the author refine their prose, structure, pacing, and clarity.

AI Personality Style (follow this strictly at all times):
${personalityModifier}

Task: ${prompts[i] || topicPrompt}

Response style: ${
      depth === "quick"
        ? "Provide a concise 3–5 sentence writing improvement summary."
        : "Provide a detailed writing analysis with clear sections, bullet points, and actionable revision suggestions. Maintain the selected personality tone strictly."
    }
    `.trim();

    // ⭐ NEW: Load manuscript for this session
    const manuscript = JSON.parse(localStorage.getItem("manuscript"));
    if (!manuscript || !manuscript.text) {
      window.setGlobalError("Please upload a manuscript first.");
      setLoadingState((p) => ({ ...p, [i]: null }));
      return;
    }

    // ⭐ NEW: Combine manuscript with the prompt
    const finalPrompt = `
${promptToSend}

=========================
📘 FULL MANUSCRIPT CONTEXT:
${manuscript.text}
    `.trim();

    try {
      const res = await fetch("https://aipublishing.onrender.com/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }), // ⭐ UPDATED
      });

      const data = await res.json();

      if (!res.ok) {
        window.setGlobalError(data.error || "Writing advice request failed.");
        throw new Error(data.error || "Writing advice request failed");
      }

      const updated = { ...responses, [i]: data.text };
      setResponses(updated);

      if (typeof onResponsesUpdate === "function") {
        onResponsesUpdate(updated);
      }

      setOpenSections((p) => ({ ...p, [i]: true }));
    } catch (err) {
      console.error(err);
      window.setGlobalError(
        "Error generating writing advice. Please try again."
      );

      const updated = {
        ...responses,
        [i]: "⚠️ Error generating writing advice. Please check your connection.",
      };
      setResponses(updated);

      if (typeof onResponsesUpdate === "function") {
        onResponsesUpdate(updated);
      }
    } finally {
      setLoadingState((p) => ({ ...p, [i]: null }));
    }
  };

  const toggleSection = (i) =>
    setOpenSections((p) => ({ ...p, [i]: !p[i] }));

  const toggleEditPrompt = (i) =>
    setEditPromptOpen((p) => ({ ...p, [i]: !p[i] }));

  const sections = [
    {
      title: "1. Narrative Clarity & Flow",
      description:
        "Get feedback on whether your scenes, pacing, and transitions are working smoothly.",
      prompt:
        "Analyze the manuscript’s clarity, flow, pacing, and scene-to-scene transitions. Identify where the narrative slows down or becomes confusing.",
    },
    {
      title: "2. Character Development",
      description:
        "Learn how strong and consistent your character arcs and motivations are.",
      prompt:
        "Evaluate character development, motivations, growth, voice consistency, and emotional impact.",
    },
    {
      title: "3. Writing Style & Voice",
      description:
        "Improve sentence quality, tone, and overall stylistic cohesion.",
      prompt:
        "Assess the manuscript’s writing style, tone, and voice. Identify strengths and areas for stylistic refinement.",
    },
    {
      title: "4. Structural Strength",
      description:
        "Analyze plot architecture, chapters, arcs, and structural pacing.",
      prompt:
        "Provide a structural analysis of the manuscript’s plot arcs, chapter organization, and narrative architecture.",
    },
    {
      title: "5. Emotional & Thematic Impact",
      description:
        "Understand how effectively your themes and emotional beats are landing.",
      prompt:
        "Analyze the manuscript's thematic clarity and emotional resonance. Identify strong moments and missed opportunities.",
    },
  ];

  return (
    <Container className="py-4 text-start">
      <h2 className="mb-4 text-center text-primary">✍️ Writing Advice</h2>

      {sections.map((section, index) => (
        <Card key={index} className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="align-items-center mb-2">
              <Col className="flex-grow-1">
                <Card.Title className="fw-bold mb-0">
                  {section.title}
                </Card.Title>
              </Col>

              <Col xs="auto">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => toggleEditPrompt(index)}
                >
                  {editPromptOpen[index] ? "Done" : "✏️ Edit Prompt"}
                </Button>
              </Col>
            </Row>

            <Card.Text className="text-muted">{section.description}</Card.Text>

            <Collapse in={editPromptOpen[index]}>
              <div className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Prompt being sent:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={prompts[index] ?? section.prompt}
                    onChange={(e) =>
                      handlePromptChange(index, e.target.value)
                    }
                  />
                </Form.Group>
              </div>
            </Collapse>

            <div className="d-flex flex-wrap gap-2 mb-2">
              <Button
                variant="outline-success"
                disabled={!!loadingState[index]}
                onClick={() =>
                  handleFeedback(index, section.prompt, "quick")
                }
              >
                {loadingState[index] === "quick" ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Quick Summary"
                )}
              </Button>

              <Button
                variant="outline-primary"
                disabled={!!loadingState[index]}
                onClick={() =>
                  handleFeedback(index, section.prompt, "in-depth")
                }
              >
                {loadingState[index] === "in-depth" ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "In-Depth Advice"
                )}
              </Button>

              {responses[index] && (
                <Button
                  variant="outline-secondary"
                  onClick={() => toggleSection(index)}
                >
                  {openSections[index] ? "▲ Minimize" : "▼ Expand"}
                </Button>
              )}
            </div>

            <Collapse in={openSections[index]}>
              <div
                className="mt-3 p-3 bg-light border rounded"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {responses[index] || ""}
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default WritingAdviceTab;
