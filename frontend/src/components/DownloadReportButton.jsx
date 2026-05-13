import React from "react";
import { Button } from "react-bootstrap";

function DownloadReportButton({ writingResponses, marketingResponses, onDownload }) {
  const handleDownload = () => {
    let reportText = "📖 Reader AI - Combined Report\n\n";

    if (Object.keys(writingResponses).length > 0) {
      reportText += "=== Writing Advice ===\n";
      for (const [key, value] of Object.entries(writingResponses)) {
        reportText += `\nSection ${key}:\n${value}\n`;
      }
      reportText += "\n";
    }

    if (Object.keys(marketingResponses).length > 0) {
      reportText += "=== Marketing Analysis ===\n";
      for (const [key, value] of Object.entries(marketingResponses)) {
        reportText += `\nSection ${key}:\n${value}\n`;
      }
    }

    // Create the file
    const blob = new Blob([reportText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ReaderAI_Report.txt";
    link.click();

    if (onDownload) onDownload();
  };

  return (
    <Button variant="outline-light" className="fw-semibold" onClick={handleDownload}>
      📄 Download Report
    </Button>
  );
}

export default DownloadReportButton;
