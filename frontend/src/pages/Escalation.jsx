import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Escalation({ status, onGoHome }) {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-[#f6fcf7]">
      <Header title="Officer Request" showBack />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow p-8 border border-green-100 text-center flex flex-col items-center">
          {/* Green check icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Request Submitted</h2>
          <div className="text-gray-700 mb-6">Your query has been forwarded to our agricultural officer.</div>
          {/* Status box */}
          <div className="w-full max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="font-semibold text-blue-700">Status: {status?.status || "Pending"}</span>
            </div>
            <div className="text-xs text-blue-700">Expected response time: 2-4 hours</div>
          </div>
          <div className="text-gray-500 text-sm mb-8">You will receive a notification when the officer responds.<br/>Check the History page to track your request.</div>
          <button className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-lg transition flex items-center justify-center gap-2" onClick={onGoHome}>
            Go to Home
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
