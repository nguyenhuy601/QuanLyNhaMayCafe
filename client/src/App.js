import Sidebar from "./components/sidebar.jsx";
import Topbar from "./components/topbar.jsx";
import Welcome from "./components/welcome.jsx";

export default function App() {
  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-white">
        <Topbar />
        <Welcome />
      </div>
    </div>
  );
}
