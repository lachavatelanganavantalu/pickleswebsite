# Visibility And Progress

The website user should be able to see that the agent is actively working.

## Visible To The User

- the launcher opening
- the chat / intent panel
- the current step name
- the current target element or route
- pause reasons
- human handoff boundaries
- success or failure state
- optional audit-like action logs

## Optional Desktop Mode Visibility

In live desktop mode, the cursor can visibly move and click before each action.
That is an execution detail, not a requirement for every adapter.

## What Should Stay Internal

- chain-of-thought style reasoning
- internal helper-agent orchestration details
- raw low-level perception output

## Product Rule

Every adapter should provide at least one visible progress surface, even if it
is only a compact action log or step tracker.

