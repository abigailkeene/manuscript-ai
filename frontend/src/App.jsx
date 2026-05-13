import React, { useState } from "react";
import {
  Container,
  Navbar,
  Tab,
  Tabs,
  Button,
  Modal,
  Alert,
  Form
} from "react-bootstrap";

import UploadTab from "./components/UploadTab";
import WritingAdviceTab from "./components/WritingAdviceTab";
import MarketInsightsTab from "./components/MarketInsightsTab";
import MarketingStrategyTab from "./components/MarketingStrategyTab";
import BookQualityCheckTab from "./components/BookQualityCheckTab";

import "./App.css";

function App() {
  const [key, setKey] = useState("upload");

  // Personality selection
  const [personality, setPersonality] = useState("gentle");

  // Responses from each tab
  const [writingResponses, setWritingResponses] = useState({});
  const [marketInsightsResponses, setMarketInsightsResponses] = useState({});
  const [marketingStrategyResponses, setMarketingStrategyResponses] = useState({});
  const [bookQualityResponses, setBookQualityResponses] = useState({});

  // Global error modal
  const [globalError, setGlobalError] = useState("");
  const [showGlobalError, setShowGlobalError] = useState(false);

  window.setGlobalError = (msg) => {
    setGlobalError(msg);
    setShowGlobalError(true);
  };

  const hasReportContent =
    Object.keys(writingResponses).length > 0 ||
    Object.keys(marketInsightsResponses).length > 0 ||
    Object.keys(marketingStrategyResponses).length > 0 ||
    Object.keys(bookQualityResponses).length > 0;

  const handleDownloadReport = () => {
    let reportText = "📖 Reader AI - Combined Report\n\n";

    if (Object.keys(writingResponses).length > 0) {
      reportText += "=== Writing Advice ===\n";
      for (const [section, text] of Object.entries(writingResponses)) {
        reportText += `\nSection ${section}:\n${text}\n`;
      }
      reportText += "\n";
    }

    if (Object.keys(marketInsightsResponses).length > 0) {
      reportText += "=== Market Insights ===\n";
      for (const [section, text] of Object.entries(marketInsightsResponses)) {
        reportText += `\nSection ${section}:\n${text}\n`;
      }
      reportText += "\n";
    }

    if (Object.keys(marketingStrategyResponses).length > 0) {
      reportText += "=== Marketing Strategy ===\n";
      for (const [section, text] of Object.entries(marketingStrategyResponses)) {
        reportText += `\nSection ${section}:\n${text}\n`;
      }
      reportText += "\n";
    }

    if (Object.keys(bookQualityResponses).length > 0) {
      reportText += "=== Book Quality Check ===\n";
      for (const [section, text] of Object.entries(bookQualityResponses)) {
        reportText += `\nSection ${section}:\n${text}\n`;
      }
      reportText += "\n";
    }

    const blob = new Blob([reportText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ReaderAI_Report.txt";
    link.click();
  };

  return (
    <>
      {/* GLOBAL ERROR POPUP */}
      <Modal
        show={showGlobalError}
        onHide={() => setShowGlobalError(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger" className="fw-semibold mb-0">
            {globalError}
          </Alert>
        </Modal.Body>
      </Modal>

      {/* NAVBAR */}
      <Navbar
        expand="lg"
        className="shadow-sm px-3"
        style={{
          background: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)",
        }}
      >
        <Container fluid className="d-flex justify-content-between align-items-center">
          <Navbar.Brand className="text-white fw-semibold fs-4 m-0">
            📖 Reader AI
          </Navbar.Brand>

          {hasReportContent && (
            <Button
              variant="outline-light"
              className="fw-semibold"
              onClick={handleDownloadReport}
            >
              📄 Download Report
            </Button>
          )}
        </Container>
      </Navbar>

      {/* PAGE CONTENT */}
      <Container className="py-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Refine Your Writing with AI-Powered Insight</h2>
          <p className="text-muted">
            Upload your manuscript and explore expert-level insights on writing quality,
            market alignment, audience fit, and promotion strategy.
          </p>
        </div>

        {/* TABS */}
        <Tabs
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-4 justify-content-center"
          fill
        >
          <Tab eventKey="upload" title="📤 Upload Manuscript">
            <UploadTab
              onUploadComplete={() => setKey("advice")}
              personality={personality}
              setPersonality={setPersonality}
            />
          </Tab>


          <Tab eventKey="advice" title="✍️ Writing Advice">
            <WritingAdviceTab
              onResponsesUpdate={setWritingResponses}
              personality={personality}
            />
          </Tab>

          <Tab eventKey="insights" title="📊 Market Insights">
            <MarketInsightsTab
              onResponsesUpdate={setMarketInsightsResponses}
              personality={personality}
            />
          </Tab>

          <Tab eventKey="strategy" title="📣 Marketing Strategy">
            <MarketingStrategyTab
              onResponsesUpdate={setMarketingStrategyResponses}
              personality={personality}
            />
          </Tab>

          <Tab eventKey="quality" title="📘 Book Quality Check">
            <BookQualityCheckTab
              onResponsesUpdate={setBookQualityResponses}
              personality={personality}
            />
          </Tab>
        </Tabs>
      </Container>

      <footer className="text-center text-muted py-3 border-top">
        © {new Date().getFullYear()} Reader AI
      </footer>
    </>
  );
}

export default App;
