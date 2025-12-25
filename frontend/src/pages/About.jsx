import Header from "../components/Header";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-white">
      <Header title="About" showBack />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-2xl bg-white rounded-2xl shadow p-8 border border-green-100">
          <h2 className="text-2xl font-bold text-green-700 mb-4">About Digital Krishi Officer</h2>
          <p className="text-gray-700 mb-2">
            Digital Krishi Officer – Farmer Advisory System is a digital platform designed to provide timely, accurate, and personalized agricultural advice to farmers. It leverages AI and expert knowledge to answer queries, provide crop and pest management guidance, weather updates, and information on government schemes.
          </p>
          <p className="text-gray-700 mb-2">
            The system supports multilingual interaction and is accessible on mobile and desktop devices, ensuring inclusivity for all farmers.
          </p>
          <p className="text-gray-500 text-xs mt-6">Version 1.0. &copy; {new Date().getFullYear()} FarmerAssist.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
