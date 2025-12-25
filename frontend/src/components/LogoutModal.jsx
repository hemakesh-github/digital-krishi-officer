import React from "react";

export default function LogoutModal({ open, onCancel, onLogout }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-2">Logout Confirmation</div>
        <div className="text-gray-600 text-center mb-6 text-sm">Are you sure you want to logout from Digital Krishi Officer?</div>
        <div className="flex w-full gap-4">
          <button
            className="flex-1 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold text-base hover:bg-gray-100 transition flex items-center justify-center gap-2"
            onClick={onCancel}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Cancel
          </button>
          <button
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-base transition flex items-center justify-center gap-2"
            onClick={onLogout}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
