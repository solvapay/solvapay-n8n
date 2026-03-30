# SolvaPay API Gaps

Tracked issues in the SolvaPay API that affect this n8n node. The implementation works correctly today via mitigations and is ready to upgrade when gaps are closed.

| ID | Title | Impact on Node | Status |
|---|---|---|---|
| GAP-1 | `ensure_customer` throws on duplicate | Mitigated via two-step fallback in `ensureCustomer()` in GenericFunctions.ts | Open |
| GAP-2 | `GET /transactions/:id` returns null | Mitigated via list+filter fallback in the Transaction `get` operation | Open |
| GAP-3 | No programmatic webhook API | Mitigated via `WEBHOOK_API_AVAILABLE` flag + dashboard notice in SolvaPayTrigger | Open |
| GAP-4 | Webhook event type strings unconfirmed | Using recommended strings; verify and update when confirmed | Open |
| GAP-5 | `update_plan` not in MCP surface | No impact on n8n node (uses REST directly) | Open |

## Resolution Notes

- **GAP-1:** When resolved, remove the `isAlreadyExistsError` fallback from `GenericFunctions.ts`. The `ensureCustomer` function can then call `/customers/ensure` directly.
- **GAP-2:** When resolved, remove the list+filter fallback from the Transaction `get` operation in `SolvaPay.node.ts`.
- **GAP-3:** When resolved, set `WEBHOOK_API_AVAILABLE = true` in `SolvaPayTrigger.node.ts`. The auto-register implementation (Implementation A) is already built and ready.
- **GAP-4:** When confirmed, update the event strings in `SolvaPayTrigger.node.ts` if they differ from the current values.
