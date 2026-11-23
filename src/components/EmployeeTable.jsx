export default function EmployeeTable({ employees, currentUser, onEdit, onDelete }) {
  if (employees.length === 0) {
    return <div className="empty">No employees found.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Role</th>
            <th>Contact</th>
            <th>Salary</th>
            <th>Joined</th>
            <th>Added By</th>
            <th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => {
            const isMine =
              currentUser &&
              (String(e.userId) === String(currentUser.id) || e.addedBy === currentUser.name);

            return (
              <tr key={e.id}>
                <td>
                  <div className="name-cell">
                    <span className="avatar">{e.name.charAt(0).toUpperCase()}</span>
                    <div>
                      <div className="strong">{e.name}</div>
                      <div className="muted small">{e.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge">{e.department}</span></td>
                <td>{e.role}</td>
                <td>{e.phone}</td>
                <td>₹{Number(e.salary).toLocaleString("en-IN")}</td>
                <td>{e.joined}</td>
                <td>
                  {isMine ? (
                    <span className="badge you-badge" title="Added by you">
                      You ({currentUser.name})
                    </span>
                  ) : (
                    <span className="badge other-badge" title={`Added by ${e.addedBy || "Admin"}`}>
                      {e.addedBy || "Admin"}
                    </span>
                  )}
                </td>
                <td className="actions">
                  <button className="btn small" onClick={() => onEdit(e)}>Edit</button>
                  <button className="btn small danger" onClick={() => onDelete(e.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
