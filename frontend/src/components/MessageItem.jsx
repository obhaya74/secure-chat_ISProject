export default function MessageItem({ msg }) {
  const isMine = msg.sender === "me";

  return (
    <div className={`message-item ${isMine ? "my-message" : "their-message"}`}>
      {msg.text}
    </div>
  );
}
