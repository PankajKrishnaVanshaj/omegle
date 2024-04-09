// app.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./components/Landing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/room" element={<Room />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
