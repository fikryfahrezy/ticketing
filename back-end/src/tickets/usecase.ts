import {
  TICKET_STATUS,
  type NewTicketInput,
  type RetryFailedTriageResult,
  type Ticket,
  type TicketStatus,
  type TicketUpdateInput,
  type TriageResult,
} from "./types.ts";

export type TicketRepository = {
  createTicket: (input: NewTicketInput) => Promise<Ticket>;
  getTicket: (id: string) => Promise<Ticket | null>;
  listTickets: (status?: TicketStatus) => Promise<Ticket[]>;
  setTriageResult: (id: string, result: TriageResult) => Promise<Ticket | null>;
  setTriageError: (id: string, message: string) => Promise<void>;
  setTicketPending: (id: string) => Promise<Ticket | null>;
  updateDraftResponse: (id: string, draftResponse: string) => Promise<Ticket | null>;
  resolveTicket: (id: string, draftResponse?: string) => Promise<Ticket | null>;
};

export type TriageService = {
  triage: (input: NewTicketInput) => Promise<TriageResult>;
};

export class TicketUsecase {
  private readonly repository: TicketRepository;
  private readonly triageService: TriageService;
  private readonly triageQueue: string[] = [];
  private readonly queuedTicketIds = new Set<string>();
  private readonly maxConcurrentTriage = 3;
  private readonly inFlightTriages = new Set<Promise<void>>();
  private hasStartedRecovery = false;
  private isQueueRunning = false;

  constructor(deps: { repository: TicketRepository; triageService: TriageService }) {
    this.repository = deps.repository;
    this.triageService = deps.triageService;
  }

  async createTicketWithTriage(input: NewTicketInput): Promise<Ticket> {
    const ticket = await this.repository.createTicket(input);
    this.queueTriage(ticket.id);
    return ticket;
  }

  queueTriage(ticketId: string): void {
    if (this.queuedTicketIds.has(ticketId)) {
      return;
    }

    this.triageQueue.push(ticketId);
    this.queuedTicketIds.add(ticketId);
    this.runQueue().catch((error) => {
      console.error("Triage queue failed", error);
    });
  }

  startPendingTriageRecovery(): void {
    if (this.hasStartedRecovery) {
      return;
    }

    this.hasStartedRecovery = true;
    this.recoverPendingTriages().catch((error) => {
      console.error("Failed to recover pending triage queue", error);
    });
  }

  private async recoverPendingTriages(): Promise<void> {
    const pendingTickets = await this.repository.listTickets(TICKET_STATUS.PENDING);
    for (const ticket of pendingTickets) {
      this.queueTriage(ticket.id);
    }
  }

  private async runQueue(): Promise<void> {
    if (this.isQueueRunning) {
      return;
    }

    this.isQueueRunning = true;
    try {
      while (this.triageQueue.length > 0 || this.inFlightTriages.size > 0) {
        while (this.triageQueue.length > 0 && this.inFlightTriages.size < this.maxConcurrentTriage) {
          const ticketId = this.triageQueue.shift();
          if (!ticketId) {
            continue;
          }

          this.queuedTicketIds.delete(ticketId);

          const triageTask = this.triageTicket(ticketId)
            .catch((error) => {
              console.error("Triage task failed", error);
            })
            .finally(() => {
              this.inFlightTriages.delete(triageTask);
            });

          this.inFlightTriages.add(triageTask);
        }

        if (this.inFlightTriages.size > 0) {
          await Promise.race(this.inFlightTriages);
        }
      }
    } finally {
      this.isQueueRunning = false;

      if (this.triageQueue.length > 0) {
        this.runQueue().catch((error) => {
          console.error("Triage queue failed", error);
        });
      }
    }
  }

  async retryFailedTicketTriage(ticketId: string): Promise<RetryFailedTriageResult | null> {
    const ticket = await this.repository.getTicket(ticketId);
    if (!ticket) {
      return null;
    }

    if (ticket.status !== TICKET_STATUS.FAILED) {
      return {
        ticket,
        queued: false,
      };
    }

    const pendingTicket = await this.repository.setTicketPending(ticketId);
    if (!pendingTicket) {
      return null;
    }

    this.queueTriage(ticketId);
    return {
      ticket: pendingTicket,
      queued: true,
    };
  }

  async triageTicket(ticketId: string): Promise<void> {
    const ticket = await this.repository.getTicket(ticketId);
    if (!ticket || ticket.status === TICKET_STATUS.RESOLVED) {
      return;
    }

    try {
      const result = await this.triageService.triage({
        subject: ticket.subject,
        message: ticket.message,
        requesterName: ticket.requesterName,
        requesterEmail: ticket.requesterEmail,
      });

      await this.repository.setTriageResult(ticketId, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await this.repository.setTriageError(ticketId, message);
    }
  }

  async listAllTickets(status?: TicketStatus): Promise<Ticket[]> {
    return this.repository.listTickets(status);
  }

  async findTicket(id: string): Promise<Ticket | null> {
    return this.repository.getTicket(id);
  }

  async updateTicket(id: string, input: TicketUpdateInput): Promise<Ticket | null> {
    const existingTicket = await this.repository.getTicket(id);
    if (!existingTicket) {
      return null;
    }

    if (existingTicket.status !== TICKET_STATUS.PENDING && existingTicket.status !== TICKET_STATUS.TRIAGED) {
      return existingTicket;
    }

    if (input.status === TICKET_STATUS.RESOLVED) {
      return this.repository.resolveTicket(id, input.draftResponse);
    }

    if (input.draftResponse !== undefined) {
      return this.repository.updateDraftResponse(id, input.draftResponse);
    }

    return existingTicket;
  }
}
