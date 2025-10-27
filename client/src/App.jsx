import { Routes, Route } from "react-router-dom";
import QCRoute from "./routes/QCRoute";
import KhoNVLRoute from "./routes/KhoNVLRoute";


function App() {
  return (
    <Routes>
      {/* Route QC */}
      <Route path="/qc/*" element={<QCRoute />} />

      {/* Route Kho NVL */}
      <Route path="/kho/*" element={<KhoNVLRoute />} />
    </Routes>
  );
}

export default App;
