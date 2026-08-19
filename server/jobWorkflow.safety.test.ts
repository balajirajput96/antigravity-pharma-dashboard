import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  storagePut: vi.fn(),
  notifyOwner: vi.fn(),
}));

vi.mock("./db", () => ({ getDb: mocks.getDb }));
vi.mock("./storage", () => ({ storagePut: mocks.storagePut }));
vi.mock("./_core/notification", () => ({ notifyOwner: mocks.notifyOwner }));

import { ingestJobRun, recordConfirmedSend } from "./jobWorkflow";

function selectWithLimit(result: unknown) {
  return {
    from: vi.fn(() => ({
      where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue(result) })),
    })),
  };
}

function selectWithJoinWhere(result: unknown) {
  return {
    from: vi.fn(() => ({
      innerJoin: vi.fn(() => ({ where: vi.fn().mockResolvedValue(result) })),
    })),
  };
}

function selectWithJoinWhereLimit(result: unknown) {
  return {
    from: vi.fn(() => ({
      innerJoin: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue(result) })),
      })),
    })),
  };
}

function selectWithWhere(result: unknown) {
  return {
    from: vi.fn(() => ({ where: vi.fn().mockResolvedValue(result) })),
  };
}

describe("job workflow safety rules", () => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.OUTBOUND_EMAIL_WEBHOOK_URL;
    mocks.getDb.mockResolvedValue(db);
    db.insert.mockImplementation(() => ({
      values: vi.fn().mockResolvedValue(undefined),
    }));
    db.update.mockImplementation(() => ({
      set: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
    }));
  });

  it("marks a previously audited employer as Skipped-Duplicate and does not prepare outreach", async () => {
    const runValues = vi.fn().mockResolvedValue(undefined);
    const leadValues = vi.fn().mockResolvedValue([{ insertId: 101 }]);
    db.insert
      .mockImplementationOnce(() => ({ values: runValues }))
      .mockImplementationOnce(() => ({ values: leadValues }));
    db.select
      .mockImplementationOnce(() =>
        selectWithLimit([{ id: 1, ownerOpenId: "owner-id", runKey: "run-key" }])
      )
      .mockImplementationOnce(() =>
        selectWithJoinWhere([{ employer: "Aurobindo Pharma" }])
      )
      .mockImplementationOnce(() =>
        selectWithLimit([
          {
            id: 101,
            runId: 1,
            employer: "Aurobindo Pharma Pvt. Ltd.",
            roleTitle: "IPQA Officer",
            status: "Skipped-Duplicate",
          },
        ])
      )
      .mockImplementationOnce(() =>
        selectWithWhere([
          { id: 10, runId: 1, kind: "report" },
          { id: 11, runId: 1, kind: "audit" },
        ])
      );
    mocks.storagePut
      .mockResolvedValueOnce({
        key: "reports/run-key.md",
        url: "https://storage.example/report",
      })
      .mockResolvedValueOnce({
        key: "audits/run-key.jsonl",
        url: "https://storage.example/audit",
      });

    const result = await ingestJobRun("owner-id", [
      {
        employer: "Aurobindo Pharma Pvt. Ltd.",
        roleTitle: "IPQA Officer",
        sourceUrl: "https://careers.example/auro-qa",
        vacancyText: "Public IPQA vacancy",
        publicContactEmail: "careers@example.com",
      },
    ]);

    expect(leadValues).toHaveBeenCalledWith(
      expect.objectContaining({ status: "Skipped-Duplicate" })
    );
    expect(db.insert).toHaveBeenCalledTimes(3);
    expect(result).toMatchObject({
      totalAudited: 1,
      preparedCount: 0,
      skippedCount: 1,
    });
    expect(mocks.notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("0 new drafts"),
      })
    );
  });

  it("records explicit confirmation as held and sends nothing when no delivery provider is configured", async () => {
    const updateSet = vi.fn(() => ({
      where: vi.fn().mockResolvedValue(undefined),
    }));
    const eventValues = vi.fn().mockResolvedValue(undefined);
    db.update.mockImplementationOnce(() => ({ set: updateSet }));
    db.insert.mockImplementationOnce(() => ({ values: eventValues }));
    db.select.mockImplementationOnce(() =>
      selectWithJoinWhereLimit([
        {
          draft: {
            id: 7,
            leadId: 55,
            recipientEmail: "careers@example.com",
            subject: "Application for QA role",
            body: "Truthful draft",
            status: "Prepared",
          },
          run: { ownerOpenId: "owner-id" },
        },
      ])
    );

    const result = await recordConfirmedSend("owner-id", 7);

    expect(result).toEqual({
      alreadySent: false,
      deliveryConfigured: false,
      deliverySent: false,
    });
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ confirmedAt: expect.any(Date) })
    );
    expect(eventValues).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "confirmation-held" })
    );
  });
});
