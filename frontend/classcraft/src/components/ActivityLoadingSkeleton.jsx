import "../css/activity_loading_skeleton.css";

export default function ActivityLoadingSkeleton() {
  return (
    <main className="activity-loading" aria-busy="true" aria-label="Preparing activity">
      <div className="activity-loading-header">
        <span />
        <span />
      </div>
      <div className="activity-loading-title" />
      <div className="activity-loading-description" />
      <div className="activity-loading-workspace">
        <div className="activity-loading-panel" />
        <div className="activity-loading-panel" />
      </div>
      <div className="activity-loading-footer">
        <span />
        <span />
      </div>
    </main>
  );
}
