export function ApprovalsTab() {
  return (
    <div className="approvals-tab">
      <div className="approvals-empty-state">
        <div className="empty-state-illustration">
          <div className="payroll-icon">
            <div className="icon-container">
              <div className="dollar-sign">$</div>
              <div className="checkmark">✓</div>
            </div>
          </div>
        </div>
        
        <div className="empty-state-content">
          <h3 className="empty-state-title">No pay periods set up yet</h3>
          <p className="empty-state-description">
            Process timesheets for payroll with fixed<br />
            pay periods and approval workflows.
          </p>
          
          <button className="setup-payroll-btn">
            Set up Pay Periods
          </button>
        </div>
      </div>
    </div>
  )
}

