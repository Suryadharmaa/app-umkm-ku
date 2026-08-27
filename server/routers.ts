import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { PDFParse } from "pdf-parse";
import { z } from "zod";

function moneyFromTemplate(text: string, label: string) {
  const match = text.match(new RegExp(`${label}[\\s\\S]{0,90}?Rp\\s*([0-9.]+)`, "i"));
  return match ? Number(match[1].replace(/[^0-9]/g, "")) : 0;
}

function reportDateFromTemplate(text: string) {
  const period = text.match(/\((\d{4})-(\d{2})\)/)?.slice(1);
  const day = text.match(/(?:Sen|Sel|Rab|Kam|Jum|Sab|Min),?\s*(\d{1,2})\s+[A-Za-z]+/i)?.[1] ?? "1";
  if (!period) return new Date().toISOString();
  return `${period[0]}-${period[1]}-${String(day).padStart(2, "0")}T12:00:00.000Z`;
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  financeImport: router({
    parsePdf: publicProcedure
      .input(z.object({ base64: z.string().min(100).max(14_000_000), fileName: z.string().max(200) }))
      .mutation(async ({ input }) => {
        const parser = new PDFParse({ data: Buffer.from(input.base64, "base64") });
        try {
          const parsed = await parser.getText();
          const text = parsed.text;
          const income = moneyFromTemplate(text, "TOTAL PEMASUKAN");
          const expense = moneyFromTemplate(text, "TOTAL PENGELUARAN");
          if (!income && !expense) throw new Error("Kolom total pemasukan atau pengeluaran tidak ditemukan pada PDF.");
          const date = reportDateFromTemplate(text);
          return {
            reportName: input.fileName,
            periodLabel: text.match(/Periode:\s*([^\n]+)/i)?.[1]?.trim() ?? "Periode laporan",
            transactions: [
              ...(income ? [{ type: "income" as const, amount: income, note: `Impor ${input.fileName} · total pemasukan`, category: "Penjualan" as const, date }] : []),
              ...(expense ? [{ type: "expense" as const, amount: expense, note: `Impor ${input.fileName} · total pengeluaran`, category: "Operasional" as const, date }] : []),
            ],
          };
        } finally {
          await parser.destroy();
        }
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
