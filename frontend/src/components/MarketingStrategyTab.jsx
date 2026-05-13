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

// ✔ Personality definitions (required)
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

// ✔ Added personality as a required prop
function MarketingStrategyTab({ onResponsesUpdate, personality }) {
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
    You are a professional book marketing strategist.
    Your goal is to give clear, actionable, realistic marketing steps for the manuscript based on its content.
    
    AI Personality Style (follow this strictly at all times):
    ${personalityModifier}
    
    Task: ${prompts[i] || topicPrompt}
    
    Response style: ${
      depth === "quick"
        ? "Provide a short 3–5 sentence actionable summary."
        : "Provide a detailed, structured marketing strategy with sections, bullet points, and practical steps. Maintain a professional, neutral tone unless the selected personality instructs otherwise."
    }
    `.trim();

    // ⭐ NEW — Load manuscript for this session
    const manuscript = JSON.parse(localStorage.getItem("manuscript"));
    if (!manuscript || !manuscript.text) {
      window.setGlobalError("Please upload a manuscript first.");
      setLoadingState((p) => ({ ...p, [i]: null }));
      return;
    }

    // ⭐ NEW — Combine marketing prompt + manuscript text
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
        window.setGlobalError(data.error || "Marketing strategy request failed.");
        throw new Error(data.error || "Marketing strategy request failed");
      }

      const updated = { ...responses, [i]: data.text };
      setResponses(updated);

      if (typeof onResponsesUpdate === "function") {
        onResponsesUpdate(updated);
      }

      setOpenSections((p) => ({ ...p, [i]: true }));
    } catch (err) {
      console.error(err);
      window.setGlobalError("Error generating marketing strategy. Please try again.");

      const updated = {
        ...responses,
        [i]: "⚠️ Error generating marketing strategy. Please check your connection.",
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
      title: "1. General Marketing Strategy",
      description:
        "A broad overview of how to promote your book effectively with a cohesive plan.",
      prompt:
        "Provide a general marketing strategy for this manuscript, including actionable steps for visibility, engagement, and long-term audience growth.",
    },
    {
      title: "2. Author Branding & Online Presence",
      description:
        "Recommendations for your public-facing identity as the author.",
      prompt:
        "Develop an author branding strategy, including website, tone, visual identity, and online presence tailored to the manuscript’s genre and audience.",
    },
    {
      title: "3. Social Media & Community Promotion",
      description:
        "How to use platforms like TikTok, Instagram, Reddit, or author groups to build momentum.",
      prompt:
        "Provide a social media marketing plan, including recommended platforms, content ideas, posting frequency, and community engagement strategies.",
    },
    {
      title: "4. Launch & Release Strategy",
      description:
        "Step-by-step guidance on what to do leading up to release day.",
      prompt:
        "Create a structured book launch strategy for this manuscript, including pre-launch, launch week, and post-launch actions.",
    },
    {
      title: "5. ARC, Influencer, & Reviewer Outreach",
      description:
        "How to gather early feedback, build buzz, and get reviews from the right readers.",
      prompt:
        "Provide an outreach strategy for ARC readers, influencers, reviewers, and relevant communities.",
    },
    {
      title: "6. Advertising Recommendations",
      description:
        "Guidance for paid marketing channels such as Amazon Ads, Meta Ads, BookBub, etc.",
      prompt:
        "Offer a paid advertising plan tailored to this manuscript, including recommended platforms, budgets, audiences, and ad types.",
    },
  ];

  return (
    <Container className="py-4 text-start">
      <h2 className="mb-4 text-center text-primary">📣 Marketing Strategy</h2>

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
                  <Form.Label className="fw-semibold">Prompt being sent:</Form.Label>
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
                onClick={() => handleFeedback(index, section.prompt, "quick")}
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
                onClick={() => handleFeedback(index, section.prompt, "in-depth")}
              >
                {loadingState[index] === "in-depth" ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "In-Depth Strategy"
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

export default MarketingStrategyTab;
