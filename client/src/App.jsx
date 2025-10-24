import { Routes, Route } from "react-router-dom";
import QCRoute from "./routes/QCRoute";

function App() {
  return (
    <Routes>
      <Route path="/qc/*" element={<QCRoute />} />
    </Routes>
  );
}

export default App;
