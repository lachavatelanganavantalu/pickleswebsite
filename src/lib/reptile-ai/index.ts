/**
 * @reptile/ai client-side assistance interface SDK
 * Luxury web widget & first-party workflow execution runner
 */

export interface AssistanceInterfaceOptions {
  mount: string;
  workflowBundle: string;
  title?: string;
}

interface Step {
  id: string;
  kind: string;
  label?: string;
  route: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  intentExamples: string[];
  requiredParams: string[];
  completionStateKey: string;
  completionExpectedValue: string;
  steps: Step[];
}

interface ActiveWorkflowState {
  workflowId: string;
  currentStepIndex: number;
  logs: Array<{ role: "system" | "user" | "agent"; text: string }>;
}

const SESSION_KEY = "reptile_ai_active_workflow";

export async function createAssistanceInterface(options: AssistanceInterfaceOptions): Promise<void> {
  if (typeof window === "undefined") return;

  const mountEl = document.querySelector(options.mount);
  if (!mountEl) {
    console.error(`Mount element ${options.mount} not found.`);
    return;
  }

  // Prevent multiple mounts
  if (mountEl.getAttribute("data-reptile-mounted") === "true") {
    return;
  }
  mountEl.setAttribute("data-reptile-mounted", "true");

  // Injected luxury Stylesheet
  const css = `
    .ai-launcher {
      position: fixed;
      right: 24px;
      bottom: 24px;
      border-radius: 30px;
      border: 1px solid rgba(212, 175, 55, 0.4);
      padding: 12px 24px;
      background: linear-gradient(135deg, #1c1917 0%, #0c0a09 100%);
      color: #d4af37;
      font-weight: 600;
      letter-spacing: 0.05em;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      cursor: pointer;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: Outfit, Inter, sans-serif;
      transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    }
    .ai-launcher:hover {
      transform: scale(1.03);
      box-shadow: 0 12px 35px rgba(212, 175, 55, 0.25);
    }
    .ai-launcher-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d4af37;
      box-shadow: 0 0 8px #d4af37;
      animation: ai-pulse 2s infinite;
    }
    @keyframes ai-pulse {
      0% { transform: scale(0.9); opacity: 0.6; }
      50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 12px #d4af37; }
      100% { transform: scale(0.9); opacity: 0.6; }
    }

    .ai-panel {
      position: fixed;
      right: 24px;
      bottom: 88px;
      width: min(400px, calc(100vw - 48px));
      background: rgba(28, 25, 23, 0.96);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      padding: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 16px;
      color: #fafaf9;
      font-family: Outfit, Inter, sans-serif;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
    .ai-panel.hidden {
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
    }
    .ai-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .ai-header-subtitle {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #d4af37;
    }
    .ai-header-title {
      margin: 4px 0 0;
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      letter-spacing: -0.01em;
    }
    .ai-close-btn {
      background: transparent;
      border: 0;
      color: #a8a29e;
      font-size: 24px;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
      transition: color 0.2s ease;
    }
    .ai-close-btn:hover {
      color: #d4af37;
    }

    .ai-messages {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 260px;
      overflow-y: auto;
      padding-right: 4px;
      margin: 4px 0;
    }
    .ai-message {
      border-radius: 16px;
      padding: 12px 14px;
      font-size: 13.5px;
      line-height: 1.5;
      max-width: 85%;
    }
    .ai-message.system {
      align-self: flex-start;
      background: rgba(212, 175, 55, 0.08);
      border: 1px dashed rgba(212, 175, 55, 0.3);
      color: #e7e5e4;
    }
    .ai-message.user {
      align-self: flex-end;
      background: #d4af37;
      color: #1c1917;
      font-weight: 500;
    }
    .ai-message.agent {
      align-self: flex-start;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #f5f5f4;
    }

    .ai-input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ai-input-label {
      font-size: 12px;
      font-weight: 600;
      color: #d4af37;
      letter-spacing: 0.02em;
    }
    .ai-textarea {
      width: 100%;
      resize: none;
      min-height: 80px;
      background-color: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 12px;
      padding: 10px 12px;
      font-family: inherit;
      fontSize: 13px;
      color: #fff;
      outline: none;
      transition: border-color 0.2s ease;
    }
    .ai-textarea:focus {
      border-color: #d4af37;
    }

    .ai-actions {
      display: flex;
      gap: 10px;
      margin-top: 4px;
    }
    .ai-btn-primary {
      flex: 1;
      border: 0;
      border-radius: 999px;
      padding: 10px 16px;
      background: #d4af37;
      color: #1c1917;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.03em;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }
    .ai-btn-primary:hover {
      opacity: 0.9;
    }
    .ai-btn-primary:disabled {
      background: #78716c;
      cursor: not-allowed;
    }
    .ai-btn-secondary {
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      padding: 10px 16px;
      background: rgba(255, 255, 255, 0.05);
      color: #e7e5e4;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .ai-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // Load Workflows
  let workflows: Workflow[] = [];
  try {
    const res = await fetch(options.workflowBundle);
    if (res.ok) {
      const data = await res.json();
      workflows = data.workflows || [];
    } else {
      console.error(`Failed to load workflow bundle: ${res.status}`);
    }
  } catch (err) {
    console.error("Error loading workflow bundle", err);
  }

  // Setup DOM Elements
  const container = document.createElement("div");
  container.innerHTML = `
    <button type="button" class="ai-launcher" aria-label="Open assistant">
      <span class="ai-launcher-dot"></span>
      Ask ${options.title || "ai"}
    </button>
    <section class="ai-panel hidden" aria-label="AI assistant panel">
      <div class="ai-header">
        <div>
          <div class="ai-header-subtitle">Assal Heritage</div>
          <h2 class="ai-header-title">AI Assistant</h2>
        </div>
        <button type="button" class="ai-close-btn" aria-label="Close assistant">×</button>
      </div>
      <div class="ai-messages"></div>
      <div class="ai-input-group">
        <span class="ai-input-label">YOUR REQUEST</span>
        <textarea class="ai-textarea" placeholder="e.g. Go to account page, open admin, or contact page." rows="3"></textarea>
      </div>
      <div class="ai-actions">
        <button type="button" class="ai-btn-primary">Send Request</button>
        <button type="button" class="ai-btn-secondary">Reset</button>
      </div>
    </section>
  `;

  mountEl.appendChild(container);

  const launcher = container.querySelector(".ai-launcher") as HTMLButtonElement;
  const panel = container.querySelector(".ai-panel") as HTMLElement;
  const closeBtn = container.querySelector(".ai-close-btn") as HTMLButtonElement;
  const messagesContainer = container.querySelector(".ai-messages") as HTMLElement;
  const textarea = container.querySelector(".ai-textarea") as HTMLTextAreaElement;
  const sendBtn = container.querySelector(".ai-btn-primary") as HTMLButtonElement;
  const resetBtn = container.querySelector(".ai-btn-secondary") as HTMLButtonElement;

  let messages: Array<{ role: "system" | "user" | "agent"; text: string }> = [
    {
      role: "system",
      text: "Tell me what you want to do on Assal Heritage Pickles. I will execute the corresponding workflow.",
    },
  ];

  const renderMessages = () => {
    messagesContainer.innerHTML = "";
    messages.forEach((msg) => {
      const msgEl = document.createElement("div");
      msgEl.className = `ai-message ${msg.role}`;
      msgEl.innerText = msg.text;
      messagesContainer.appendChild(msgEl);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const addMessage = (role: "system" | "user" | "agent", text: string) => {
    messages.push({ role, text });
    renderMessages();
  };

  const saveState = (workflowId: string, currentStepIndex: number) => {
    const state: ActiveWorkflowState = {
      workflowId,
      currentStepIndex,
      logs: messages,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  };

  const clearState = () => {
    sessionStorage.removeItem(SESSION_KEY);
  };

  // Toggle UI Panel
  let isPanelOpen = false;
  const setPanelOpen = (open: boolean) => {
    isPanelOpen = open;
    if (open) {
      panel.classList.remove("hidden");
      launcher.style.opacity = "0";
      launcher.style.pointerEvents = "none";
      renderMessages();
    } else {
      panel.classList.add("hidden");
      launcher.style.opacity = "1";
      launcher.style.pointerEvents = "auto";
    }
  };

  launcher.addEventListener("click", () => setPanelOpen(true));
  closeBtn.addEventListener("click", () => setPanelOpen(false));

  // Reset console
  resetBtn.addEventListener("click", () => {
    clearState();
    messages = [
      {
        role: "system",
        text: "Tell me what you want to do on Assal Heritage Pickles. I will execute the corresponding workflow.",
      },
    ];
    renderMessages();
  });

  // Intent Matcher
  const findBestWorkflow = (intent: string): Workflow | null => {
    const query = intent.toLowerCase().trim();
    let bestMatch: Workflow | null = null;
    let highestScore = 0;

    for (const wf of workflows) {
      let score = 0;
      // Check intentExamples
      for (const ex of wf.intentExamples || []) {
        const exLower = ex.toLowerCase();
        if (query === exLower) {
          score += 100;
        } else if (query.includes(exLower) || exLower.includes(query)) {
          score += 50;
        }

        // Word overlap
        const queryWords = query.split(/\s+/);
        const exWords = exLower.split(/\s+/);
        const common = queryWords.filter(w => w.length > 2 && exWords.includes(w));
        score += common.length * 10;
      }

      // Check name and description
      if (wf.name && query.includes(wf.name.toLowerCase())) {
        score += 30;
      }
      if (wf.description && query.includes(wf.description.toLowerCase())) {
        score += 20;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = wf;
      }
    }

    // Fallback keyword matching against route names (e.g. "account", "admin/orders")
    if (highestScore < 10) {
      for (const wf of workflows) {
        const pathPart = wf.id.replace("go_to_route_", "").replace(/_/g, "/");
        if (query.includes(pathPart) || query.includes(pathPart.split("/").pop() || "")) {
          bestMatch = wf;
          break;
        }
      }
    }

    return bestMatch;
  };

  // Execution flow
  const executeWorkflow = async (workflow: Workflow, startFromStepIndex = 0) => {
    sendBtn.disabled = true;
    textarea.disabled = true;

    for (let i = startFromStepIndex; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      addMessage("agent", `Executing Step ${i + 1}/${workflow.steps.length}: ${step.label || "Opening route..."}`);

      // Think delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (step.kind === "open_route") {
        const route = step.route;
        addMessage("agent", `Navigating to ${route}...`);
        
        // Save state before navigation
        saveState(workflow.id, i + 1);

        // SPA Navigation or full page redirect
        const nextRouter = (window as any).nextRouter;
        if (nextRouter) {
          nextRouter.push(route);
        } else {
          window.location.assign(route);
        }

        // Wait for page route change
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    // Clean up
    addMessage("agent", `Workflow Completed: ${workflow.name}`);
    clearState();
    sendBtn.disabled = false;
    textarea.disabled = false;
  };

  // Submit request
  const handleSend = async () => {
    const input = textarea.value.trim();
    if (!input) return;

    addMessage("user", input);
    textarea.value = "";
    addMessage("agent", "Analyzing request intent...");

    await new Promise((resolve) => setTimeout(resolve, 800));

    const match = findBestWorkflow(input);
    if (match) {
      addMessage("agent", `Intent recognized. Matching workflow: ${match.name}`);
      await executeWorkflow(match, 0);
    } else {
      addMessage("agent", "I'm sorry, I couldn't recognize that intent. Try something like: 'open account', 'go to admin dashboard', or 'view combos'.");
    }
  };

  sendBtn.addEventListener("click", handleSend);
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Resume workflow from sessionStorage if active
  const checkAndResume = async () => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return;

    try {
      const state: ActiveWorkflowState = JSON.parse(saved);
      const workflow = workflows.find((w) => w.id === state.workflowId);
      if (workflow) {
        // Restore conversation history log
        messages = state.logs;
        setPanelOpen(true);

        if (state.currentStepIndex < workflow.steps.length) {
          addMessage("agent", `Resuming workflow execution from step ${state.currentStepIndex + 1}...`);
          await executeWorkflow(workflow, state.currentStepIndex);
        } else {
          addMessage("agent", `Workflow Completed: ${workflow.name}`);
          clearState();
        }
      }
    } catch (e) {
      console.error("Error resuming workflow state", e);
      clearState();
    }
  };

  // Run initial state restore checks after workflow bundle loads
  setTimeout(checkAndResume, 500);
}
