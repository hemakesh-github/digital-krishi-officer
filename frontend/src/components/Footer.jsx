export default function Footer() {
  return (
    <footer className="w-full h-16 bg-green-800 flex flex-col items-center justify-center px-4 shadow-inner mt-auto text-white text-sm">
      <div className="flex flex-row gap-4 items-center mb-1">
        <a href="/about" className="hover:underline">About</a>
        <span className="hidden sm:inline">|</span>
        <span>Digital Krishi Officer – Farmer Advisory System</span>
      </div>
      <div className="text-xs text-gray-200">&copy; {new Date().getFullYear()} FarmerAssist. All rights reserved.</div>
    </footer>
  );
}
