# AI Support Hub

- https://ticketing.fahrezy.work
- https://ticketing-api.fahrezy.work
- https://ticketing-api.fahrezy.work/docs


### Prerequisites

- Bun 1.2 or higher

### Quick Start

#### Local Development

```bash
git clone <repository-url>
cd <clone directory>
```

#### Create .env file for each projects

```bash
# cd front-end / back-end
cp .env.example .env
```

And adjust the environment variable value if needed

#### Install dependencies

```bash
# cd front-end / back-end
bun install
```

#### Run the app

```bash
# cd front-end / back-end
bun run dev
```

#### Run using Docker

From the root of the project, first create .env file that is similar to the above, and then run:

```bash
# cd front-end / back-end
docker build -t <tag-name> .
docker run --env-file ./.env <tag-name>
```

##### With Docker Compose

```bash
# cd front-end / back-end
docker compose -f ./compose.yaml up --build
```

### Technical Implementation

#### Ticket triage queue orchestration

The backend triage workflow is implemented in the ticket use case layer and is designed to be idempotent, recoverable, and concurrency-limited.

- Queue entrypoint: creating a new ticket calls `createTicketWithTriage`, which persists the ticket and enqueues its id.
- De-duplication: `queueTriage` tracks ids in `queuedTicketIds` to prevent duplicate queue entries.
- Controlled execution: `runQueue` uses an in-memory worker loop with `maxConcurrentTriage = 3` and `inFlightTriages` to cap parallel triage jobs.
- Completion handling: each triage promise removes itself from `inFlightTriages` in `finally`, and the loop advances with `Promise.race(...)`.

#### Recovery and retry strategy

- Startup recovery: `startPendingTriageRecovery` runs once (guarded by `hasStartedRecovery`) and re-queues all tickets with `PENDING` status.
- Recovery source of truth: `recoverPendingTriages` queries repository storage (`listTickets(PENDING)`) so in-memory queue loss (for example after process restart) can be rebuilt.
- Manual retry flow: `retryFailedTicketTriage` only re-queues tickets currently in `FAILED` status.
- Retry state transition: failed tickets are first transitioned back to `PENDING` via `setTicketPending` before being queued.
- Safety behavior: if a ticket is not found or not in retryable state, the method returns without queueing.

#### Triage execution outcome

- `triageTicket` short-circuits for missing or already `RESOLVED` tickets.
- On success, AI triage output is stored using `setTriageResult`.
- On failure, errors are normalized into a message and persisted with `setTriageError` for operational visibility and later retries.

#### Frontend pending-ticket refresh strategy

The frontend uses a polling hook (`useTicketUpdate`) to keep pending tickets in sync while avoiding redundant cache invalidations.

- Polling scope: polling is enabled only when ticket status is `PENDING`.
- Polling cadence: each pending ticket runs a `2500ms` interval (`POLLING_INTERVAL`) and triggers an immediate refresh on mount.
- Refresh flow: the hook calls `getTicket(ticket.id)` and, when active and found, invalidates ticket tags.
- Invalidation dedupe: `invalidateTicketListTagDeduped` uses an in-memory in-flight map keyed by `${scope}-${ticketId ?? "all"}` to collapse concurrent invalidations for the same scope.
- Cleanup guarantees: on unmount or dependency change, the hook flips `isActive` and clears the interval to prevent stale updates.
- Fault tolerance: polling errors are caught and logged (`Failed to refresh ticket`) so transient failures do not break the UI loop.