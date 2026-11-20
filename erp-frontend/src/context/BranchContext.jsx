import { createContext, useContext, useState, useEffect } from "react"
import { setAPIBaseURL } from "../api/index"

const BRANCH1_URL = import.meta.env.VITE_API_URL || ""
const BRANCH2_URL = import.meta.env.VITE_BRANCH2_API_URL || ""

export const BRANCHES = {
  branch1: { id: "branch1", name: "Rama Coaching", shortName: "Rama", url: BRANCH1_URL, enableBatch: true },
  branch2: { id: "branch2", name: "CKC Branch",    shortName: "CKC",  url: BRANCH2_URL, enableBatch: false },
}

const BranchContext = createContext(null)

export function BranchProvider({ children }) {
  const [activeBranchId, setActiveBranchId] = useState(
    () => localStorage.getItem("activeBranch") || "branch1"
  )

  useEffect(() => {
    const saved = localStorage.getItem("activeBranch") || "branch1"
    const branch = BRANCHES[saved]
    if (branch?.url) setAPIBaseURL(branch.url)
  }, [])

  function switchBranch(branchId) {
    if (branchId === activeBranchId) return
    const branch = BRANCHES[branchId]
    if (!branch?.url) return
    localStorage.setItem("activeBranch", branchId)
    setActiveBranchId(branchId)
    setAPIBaseURL(branch.url)
    window.location.reload()
  }

  return (
    <BranchContext.Provider value={{
      activeBranchId,
      activeBranch: BRANCHES[activeBranchId],
      switchBranch,
      branch2Configured: Boolean(BRANCH2_URL),
    }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  return useContext(BranchContext)
}
