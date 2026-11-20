import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"
import { BranchProvider } from "./context/BranchContext.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BranchProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BranchProvider>
  </StrictMode>
)