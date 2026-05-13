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

// ✔ Personality rules (same as UploadTab + all other tabs)
const PERSONALITIES = {
  direct:
    "Use a direct, blunt, highly honest tone. Do not soften criticism. Prioritize truth over comfort.",
  gentle:
    "Use a soft, encouraging, supportive tone. Phrase critiques gently and highlight strengths first.",
  academic:
    "Use a scholarly, analytical tone with structured insights and formal language.",
  commercial:
    "Use an industry-focused professional tone discussing market standards, demand, and positioning.",
};

function BookQualityCheckTab({ onResponsesUpdate, personality }) {
  const [loadingState, setLoadingState] = useState({});
  const [responses, setResponses] = useState({});
  const [prompts, setPrompts] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [editPromptOpen, setEditPromptOpen] = useState({});

  const handlePromptChange = (i, value) => {
    setPrompts((prev) => ({ ...prev, [i]: value }));
  };

  const handleFeedback = async (i, topicPrompt, depth = "quick") => {
    setLoadingState((prev) => ({ ...prev, [i]: depth }));
    setResponses((prev) => ({ ...prev, [i]: "" }));

    // ⭐ LOAD USER'S OWN MANUSCRIPT (fixes multi-user session issue)
    const manuscript = JSON.parse(localStorage.getItem("manuscript"));

    if (!manuscript?.text) {
      window.setGlobalError("No manuscript found. Please upload one first.");
      return;
    }

    const personalityModifier = PERSONALITIES[personality] || "";

    const finalPrompt = `
${personalityModifier}

You are a professional publishing evaluator. 
Assess the manuscript objectively as a commercial product.

AI Personality Style (follow strictly):
${personalityModifier}

User Manuscript (analyze ONLY this):
${manuscript.text}

Task: ${prompts[i] || topicPrompt}

Response style: ${
      depth === "quick"
        ? "Provide a concise 3–5 sentence quality summary."
        : "Provide a structured, detailed evaluation using headings and bullet points. Apply the personality tone consistently throughout the analysis."
    }
`.trim();

    try {
      const res = await fetch("https://aipublishing.onrender.com/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        window.setGlobalError(
          data.error || "Book quality evaluation request failed."
        );
        throw new Error(data.error || "Book quality evaluation request failed");
      }

      const updated = { ...responses, [i]: data.text };
      setResponses(updated);

      if (typeof onResponsesUpdate === "function") {
        onResponsesUpdate(updated);
      }

      setOpenSections((prev) => ({ ...prev, [i]: true }));
    } catch {
      window.setGlobalError(
        "Error generating manuscript quality analysis. Please try again."
      );

      const updated = {
        ...responses,
        [i]: "⚠️ Error generating analysis. Please check your connection.",
      };
      setResponses(updated);

      if (typeof onResponsesUpdate === "function") {
        onResponsesUpdate(updated);
      }
    } finally {
      setLoadingState((prev) => ({ ...prev, [i]: null }));
    }
  };

  const toggleSection = (index) =>
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));

  const toggleEditPrompt = (index) =>
    setEditPromptOpen((prev) => ({ ...prev, [index]: !prev[index] }));

  // ✔ Book Quality Sections (unchanged)
  const sections = [
    {
      title: "1. Recommended Word Count & Page Length",
      description:
        "Evaluates whether the manuscript's projected length aligns with industry expectations for its genre.",
      prompt:
        "Estimate the manuscript’s approximate word count and page count based on content. Compare the length to industry standards for its genre.",
    },
    {
      title: "2. Language & Readability Level",
      description:
        "Assesses clarity, sentence structure, and reading level appropriateness.",
      prompt:
        "Analyze the manuscript’s readability level and language complexity. Comment on clarity, sentence flow, and audience suitability.",
    },
    {
      title: "3. Genre Alignment & Conventions",
      description:
        "Checks whether tone, themes, pacing, and structure match reader expectations for this genre.",
      prompt:
        "Evaluate how well the manuscript follows genre conventions. Discuss tone, structure, pacing, POV, and thematic alignment.",
    },
    {
      title: "4. Audience Appeal",
      description:
        "Considers whether the style, character depth, pacing, and themes appeal to the target demographic.",
      prompt:
        "Assess how appealing the manuscript is to its intended audience based on writing style, themes, pacing, and emotional tone.",
    },
    {
      title: "5. Product Strength: Structure, Cohesion, and Flow",
      description:
        "Looks at the book as a commercial product—how cleanly it reads, whether chapters flow, and how strong the overall structure is.",
      prompt:
        "Evaluate the manuscript as a commercial product. Discuss story cohesion, pacing balance, chapter flow, structural clarity, and consistency.",
    },
  ];

  return (
    <Container className="py-4 text-start">
      <h2 className="mb-4 text-center text-primary">📘 Book Quality Check</h2>

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
                  "In-Depth Analysis"
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

export default BookQualityCheckTab;
