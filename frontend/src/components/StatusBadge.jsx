export default function StatusBadge({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case "AI Answered":
        return "bg-green-100 text-green-800 border-green-300";
      case "Officer Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Officer Replied":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "AI Answered":
        return "✅";
      case "Officer Pending":
        return "⏳";
      case "Officer Replied":
        return "💬";
      default:
        return "❓";
    }
  };

  return (
    <span
      className={`inline-block px-4 py-2 rounded-full font-semibold text-sm border-2 ${getStatusColor()}`}
    >
      <span className="mr-2">{getIcon()}</span>
      {status}
    </span>
  );
}
