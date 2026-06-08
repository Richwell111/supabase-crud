import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import supabaseClient from "../supabaseClient";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function NotesView() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchNotes() {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setNotes(data);
      setLoading(false);
    }

    fetchNotes();
  }, []);

  async function createNote(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);

    const { data, error } = await supabaseClient
      .from("notes")
      .insert([{ title: title.trim(), content: "" }])
      .select("*")
      .single();

    if (error) {
      console.error(error);
      setCreating(false);
      return;
    }

    setNotes((prev) => [data, ...prev]);
    setTitle("");
    setCreating(false);
    navigate(`/note/${data.id}`);
  }

  async function deleteNote(id, e) {
    e.stopPropagation();
    setDeletingId(id);
    const { error } = await supabaseClient.from("notes").delete().eq("id", id);
    if (error) {
      console.error(error);
      setDeletingId(null);
      return;
    }
    setNotes((prev) => prev.filter((note) => note.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="logo-icon">📝</div>
        <h1>My Notes</h1>
        <span className="header-subtitle">{notes.length} note{notes.length !== 1 ? "s" : ""}</span>
      </header>

      {/* Create Note Form */}
      <form className="create-note-form" onSubmit={createNote}>
        <input
          id="new-note-title"
          type="text"
          placeholder="New note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={creating || !title.trim()}
        >
          {creating ? (
            <>
              <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              Creating…
            </>
          ) : (
            <>✦ Create</>
          )}
        </button>
      </form>

      {/* Notes List */}
      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <span>Loading notes…</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗒️</div>
          <p>No notes yet. Create your first one above!</p>
        </div>
      ) : (
        <>
          <p className="notes-section-title">Recent</p>
          <ul className="notes-list">
            {notes.map((note, i) => (
              <li
                key={note.id}
                className="note-card"
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => navigate(`/note/${note.id}`)}
              >
                <div className="note-card-icon">📄</div>
                <div className="note-card-body">
                  <div className="note-card-title">{note.title}</div>
                  <div className="note-card-meta">
                    {note.created_at ? formatDate(note.created_at) : ""}
                  </div>
                </div>
                <div className="note-card-actions">
                  <button
                    className="btn btn-danger"
                    onClick={(e) => deleteNote(note.id, e)}
                    disabled={deletingId === note.id}
                    title="Delete note"
                  >
                    {deletingId === note.id ? "…" : "🗑 Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default NotesView;
