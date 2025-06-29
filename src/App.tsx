import { HashRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Popup from "./pages/Popup";
import SuperPromptOptimizer from "./PromptOptimizer/PromptOptimizer";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Popup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai" element={<SuperPromptOptimizer/>}/>
      </Routes>
    </HashRouter>
  );
}
