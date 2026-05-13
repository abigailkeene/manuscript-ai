import React, { useState, useEffect } from "react";
import { Card, Form, Button, Spinner, Alert } from "react-bootstrap";

function UploadTab({ onUploadComplete, personality, setPersonality }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Load existing session uploads from localStorage
  const [uploads, setUploads] = useState(() => {
    const saved = localStorage.getItem("userUploads");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentVersion, setCurrentVersion] = useState(() => {
    const saved = localStorage.getItem("currentVersion");
    return saved ? parseInt(saved) : 1;
  });

  useEffect(() => {
    // Save uploads whenever they change
    localStorage.setItem("userUploads", JSON.stringify(uploads));
  }, [uploads]);

  useEffect(() => {
    // Save version whenever it changes
    localStorage.setItem("currentVersion", currentVersion);
  }, [currentVersion]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("version", currentVersion);

    try {
      setUploading(true);
      setMessage("");

      const res = await fetch("https://aipublishing.onrender.com/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        const fileInfo = {
          name: file.name,
          length: data.length,
          version: currentVersion,
          timestamp: Date.now()
        };

        const updatedUploads = [...uploads, fileInfo];
        setUploads(updatedUploads);

        setMessage(
          `✅ Version ${currentVersion} uploaded successfully! (${data.length.toLocaleString()} characters processed)`
        );

        setCurrentVersion((v) => v + 1);

        if (typeof onUploadComplete === "function") {
          onUploadComplete();
        }
      } else {
        setMessage(`❌ Upload failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to connect to backend. Please ensure the server is running.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <Card className="p-4 shadow-sm border-0">
      <div className="mb-4">
        <h5 className="fw-semibold text-primary mb-2">🎭 AI Personality Style</h5>
        <Form.Select
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          className="fw-semibold"
        >
          <option value="direct">Direct & Blunt Editor (Honest + Critical)</option>
          <option value="gentle">Supportive & Kind Coach (Soft + Encouraging)</option>
          <option value="academic">Academic Reviewer (Formal + Analytical)</option>
          <option value="commercial">Commercial Publishing Expert (Industry-Focused)</option>
        </Form.Select>
      </div>

      <h4 className="mb-3 fw-bold text-primary">📤 Upload Your Manuscript</h4>

      <p className="text-muted mb-4">
        Upload your manuscript and later upload a revised version for comparison.
        Accepted formats: <strong>.txt</strong> or <strong>.pdf</strong>.
      </p>

      <Form.Group className="mb-3">
        <Form.Control
          type="file"
          accept=".txt,.pdf"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </Form.Group>

      <Card className="p-3 bg-light mb-4 border-0 rounded">
        <h5 className="text-primary mb-1">Mission Statement</h5>
        <p className="mb-0 text-secondary">
          Reader AI empowers authors through clear, constructive feedback that enhances
          both technical precision and creative depth.
        </p>
      </Card>

      <div className="text-center mb-3">
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={uploading}
          className="px-4"
        >
          {uploading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Uploading...
            </>
          ) : (
            `Upload Manuscript ${currentVersion > 1 ? `(Version ${currentVersion})` : ""}`
          )}
        </Button>
      </div>

      {message && (
        <Alert
          variant={message.startsWith("✅") ? "success" : "danger"}
          className="text-center fw-semibold"
        >
          {message}
        </Alert>
      )}

      {uploads.length > 0 && (
        <div className="mt-4">
          <h6 className="fw-bold text-secondary mb-2">📚 Uploaded Manuscripts</h6>
          {uploads.map((u, i) => (
            <Card key={i} className="p-3 mb-2 border-0 bg-light">
              <div className="d-flex justify-content-between">
                <div>
                  <strong>Version {u.version}:</strong> {u.name}
                </div>
                <small className="text-muted">
                  {u.length.toLocaleString()} characters
                </small>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}

export default UploadTab;
