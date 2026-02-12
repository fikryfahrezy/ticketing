import {
  TICKET_STATUS,
  type NewTicketInput,
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
  updateDraftResponse: (id: string, draftResponse: string) => Promise<Ticket | null>;
  resolveTicket: (id: string, draftResponse?: string) => Promise<Ticket | null>;
};

export type TriageService = {
  triage: (input: NewTicketInput) => Promise<TriageResult>;
};

export class TicketUsecase {
  private readonly repository: TicketRepository;
  private readonly triageService: TriageService;

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
    setImmediate(() => {
      this.triageTicket(ticketId).catch((error) => {
        console.error("Triage failed", error);
      });
    });
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
