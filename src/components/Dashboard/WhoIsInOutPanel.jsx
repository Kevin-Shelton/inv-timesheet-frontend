/* Who Is In/Out Panel - Complete with Pagination, Tabs, Filters, and Member Cards */

:root {
  --status-indicator-size: 10px;
  --status-padding: 4px 8px;
}

/* Main Panel Container */
.who-is-in-out-panel {
  background: var(--bg-secondary, #ffffff);
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-base, 0 1px 2px rgba(0, 0, 0, 0.05));
  padding: var(--space-4, 16px);
  width: 100%;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
  font-family: inherit;
}

/* Panel Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-base, 16px);
  font-weight: var(--font-weight-semibold, 600);
  margin-bottom: var(--space-2, 8px);
}

/* Status Tabs */
.status-tabs {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-2, 8px);
  gap: var(--space-2, 8px);
}

.status-tab {
  padding: 6px 12px;
  border-radius: var(--radius-md, 8px);
  background-color: var(--color-gray-200, #e5e7eb);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  flex: 1;
  text-align: center;
}

.status-tab.active {
  background-color: var(--color-primary, #2563eb);
  color: #fff;
}

/* Filter/Search Section */
.filter-section {
  margin-top: var(--space-2, 8px);
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
}

.search-input {
  padding: 6px 10px;
  border: 1px solid var(--color-gray-200, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-size-sm, 14px);
  width: 100%;
}

/* Member List */
.member-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
}

.member-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-2, 8px);
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--color-gray-200, #e5e7eb);
  box-shadow: var(--shadow-sm, 0 1px 1px rgba(0, 0, 0, 0.03));
  background-color: #fff;
}

/* Member Header */
.member-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.member-name {
  font-weight: var(--font-weight-semibold, 600);
  font-size: var(--font-size-base, 16px);
  color: var(--color-gray-800, #1f2937);
}

/* Status Badges */
.status-badge,
.status-text {
  padding: var(--status-padding);
  border-radius: 12px;
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--font-weight-semibold, 600);
  color: #fff;
  white-space: nowrap;
}

.status-text.in {
  background-color: var(--color-success, #10b981);
}

.status-text.break {
  background-color: var(--color-warning, #f59e0b);
}

.status-text.out {
  background-color: var(--color-gray-500, #6b7280);
}

/* Meta Info */
.member-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  margin-top: var(--space-1, 4px);
  font-size: var(--font-size-xs, 12px);
  color: var(--color-gray-500, #6b7280);
}

/* Campaign + Time Labels */
.campaign-label {
  background-color: var(--color-gray-200, #e5e7eb);
  border-radius: 12px;
  padding: 2px 6px;
  font-size: var(--font-size-xs, 12px);
}

.time-label {
  font-weight: var(--font-weight-medium, 500);
}

/* Clock Section */
.clock-section {
  text-align: center;
  margin-top: var(--space-4, 16px);
  font-size: var(--font-size-base, 16px);
  color: var(--color-gray-800, #1f2937);
}

.clock-time {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold, 700);
}

.clock-date {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-gray-500, #6b7280);
  margin-top: 2px;
}