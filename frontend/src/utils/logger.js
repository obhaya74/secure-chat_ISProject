export function logClient(event, details = {}) {
  console.log(`[CLIENT] ${event}`, details);

  // Optional: send to backend
  fetch("http://localhost:5000/api/client-log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ event, details })
  }).catch(() => {});
}
