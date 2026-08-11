// categories are just UI for now, not wired to the db yet (no category column)
const PLACEHOLDER_CATEGORIES = [
  { name: 'Projects',icon: '/icons/folder.png', count: 0 },
  { name: 'Grocery', icon: '/icons/grocery.png', count: 0 },
  { name: 'Personal', icon: '/icons/personal.png', count: 0 },
  { name: 'Study', icon: '/icons/study.png', count: 0 },
  { name: 'Ideas', icon: '/icons/ideas.png', count: 0 },
];

export default function Sidebar({ noteCount }) {
  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-item active">
        <span><img src="/icons/notes.png" className="pixel-icon" width="18" height="15" alt="" />  All Notes</span>
        <span className="count">{noteCount}</span>
      </div>

      <div className="dash-sidebar-section">
        <div className="dash-sidebar-heading">
          <span>Categories</span>
          <span className="dash-sidebar-add" title="Coming in PR7">+</span>
        </div>
        {PLACEHOLDER_CATEGORIES.map((cat) => (
          <div className="dash-sidebar-item dash-sidebar-item-muted" key={cat.name}>
              <span><img src={cat.icon} className="pixel-icon" width="28" height="28" alt="" /> {cat.name}</span>            <span className="count">{cat.count}</span>
          </div>
        ))}
        <button className="dash-sidebar-add-btn" type="button" disabled>
          + Add Category
        </button>
      </div>

      <div className="dash-sidebar-note">
      Your future self will thank you.
        <br />
<img src="/icons/heart.png" className="pixel-icon" width="26" height="26" alt="" />      </div>
    </aside>
  );
}