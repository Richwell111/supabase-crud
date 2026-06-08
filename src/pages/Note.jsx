import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import supabaseClient from "../supabaseClient";

function Note() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchNote() {
      const { data, error } = await supabaseClient
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error(error);
      else {
        setNote(data);
        setContent(data.content || "");
      }
    }

    fetchNote();
  }, [id]);

  async function saveNote() {
    setSaving(true);
    setSaved(false);
    const { error } = await supabaseClient
      .from("notes")
      .update({ content })
      .eq("id", id);

    if (error) {
      console.error(error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  // Auto-save on Ctrl+S
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!saving) saveNote();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content, saving]);

  if (!note) {
    return (
      <div className="page-wrapper">
        <div className="loading-screen">
          <div className="spinner" />
          <span>Loading note…</span>
        </div>
      </div>
    );
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="note-detail-header">
        <button
          className="btn btn-ghost"
          onClick={() => navigate("/")}
          title="Back to notes"
        >
          ← Back
        </button>
        <h2>{note.title}</h2>
      </div>

      {/* Editor */}
      <div className="note-editor-wrap">
        <div className="note-editor-toolbar">
          <span>✏️ &nbsp;Content</span>
          <span className="char-count">{wordCount} word{wordCount !== 1 ? "s" : ""} · {content.length} chars</span>
        </div>
        <textarea
          id="note-content"
          className="note-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your note here… (Ctrl+S to save)"
          rows={16}
        />
      </div>

      {/* Actions */}
      <div className="note-detail-actions">
        {saved && (
          <div className="save-status">
            <span className="dot" />
            Saved successfully
          </div>
        )}
        {saving && (
          <div className="save-status">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
            Saving…
          </div>
        )}
        <button
          className="btn btn-primary"
          onClick={saveNote}
          disabled={saving}
        >
          {saving ? (
            <>
              <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              Saving…
            </>
          ) : (
            <>💾 Save Note</>
          )}
        </button>
      </div>
    </div>
  );
}

export default Note;