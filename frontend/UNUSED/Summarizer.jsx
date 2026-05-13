import React, { useState } from "react";
import { Card, Form, Button, Spinner, Alert } from "react-bootstrap";

function Summarizer({ bookText, setBookText, onSubmit }) {
  const [fileName, setFileName] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://aipublishing.onrender.com/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        setUploaded(true);
        setBookText(data.text || "");
        setMessage(`✅ File uploaded successfully: ${file.name}`);
      } else {
        setMessage(`❌ Upload failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      setMessage(`❌ Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="p-4 shadow-sm border-0">
      <h4 className="mb-3">Book Upload (PDF or TXT)</h4>
      <Form.Group className="mb-3">
        <Form.Control
          type="file"
          accept=".pdf,.txt"
          onChange={handleFile}
          disabled={uploaded || uploading}
        />
        {fileName && (
          <Form.Text muted>
            {uploaded
              ? `Loaded: ${fileName}`
              : uploading
              ? `Uploading: ${fileName}...`
              : `Selected: ${fileName}`}
          </Form.Text>
        )}
      </Form.Group>

      {message && (
        <Alert
          variant={message.includes("✅") ? "success" : "danger"}
          className="py-2"
        >
          {message}
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Extracted Book Text</Form.Label>
        <Form.Control
          as="textarea"
          rows={10}
          value={bookText}
          onChange={(e) => setBookText(e.target.value)}
          placeholder="Upload a file or paste your book text here..."
        />
      </Form.Group>

      <div className="text-end">
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={!uploaded || uploading}
        >
          {uploading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Uploading...
            </>
          ) : (
            "Summarize"
          )}
        </Button>
      </div>
    </Card>
  );
}

export default Summarizer;
