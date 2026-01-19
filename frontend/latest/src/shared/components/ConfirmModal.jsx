export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>{title}</h3>
        <p>{message}</p>

        <div style={styles.actions}>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} style={styles.confirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modal: {
    background: "#fff",
    padding: "20px",
    width: "350px",
    borderRadius: "6px"
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px"
  },
  confirm: {
    background: "#1976d2",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    cursor: "pointer",
    borderRadius: "4px"
  }
};
