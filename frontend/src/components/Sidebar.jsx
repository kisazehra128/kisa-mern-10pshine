// Categories are visual-only for now - the notes table has no category
// column yet, so these aren't wired up to real filtering. "All Notes" is
// the only real, functional item since it reflects what /api/notes returns.
const PLACEHOLDER_CATEGORIES = ['Projects', 'Grocery', 'Personal', 'Study', 'Ideas'];

export default function Sidebar({ noteCount }) {
  return (
    <aside className="dash-sidebar">
      <div>
        <div className="dash-sidebar-heading">Library</div>
        <div className="dash-sidebar-item active">
          <span>📋 All Notes</span>
          <span className="count">{noteCount}</span>
        </div>
      </div>

      <div>
        <div className="dash-sidebar-heading">Categories (coming soon)</div>
        {PLACEHOLDER_CATEGORIES.map((cat) => (
          <div className="dash-sidebar-item" key={cat} style={{ opacity: 0.55 }}>
            <span>{cat}</span>
          </div>
        ))}
      </div>

      <div className="dash-sidebar-note">Every note brings you one step closer. 💛</div>
    </aside>
  );
}