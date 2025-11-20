// src/lib/csvParser.ts
import Papa from "papaparse";

// Tipo auxiliar para lo que vamos a insertar en Supabase
export type SaleInsert = {
  dataset_id: string;
  date: string;
  amount: number;
  product: string | null;
  category: string | null;
  customer_id: string | null;
};

type RawCSVRow = Record<string, any>;

export function parseAndValidateCsv(
  file: File,
  datasetId: string,
): Promise<SaleInsert[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      // Normalizamos headers igual que antes
      transformHeader: (header) =>
        header
          .toLowerCase()
          .trim()
          .replace(/[\s_]+/g, ""),

      complete: (results) => {
        const parsedRows = results.data as RawCSVRow[];

        if (!parsedRows || parsedRows.length === 0) {
          return reject(new Error("CSV is empty"));
        }

        // 1. Validar columnas requeridas (date, amount/revenue/total)
        const first = parsedRows[0];
        const hasDate = "date" in first;
        const hasAmount =
          "amount" in first || "revenue" in first || "total" in first;

        if (!hasDate || !hasAmount) {
          return reject(
            new Error("CSV must contain 'date' and 'amount' columns."),
          );
        }

        // 2. Mapear y Limpiar
        const salesToInsert: SaleInsert[] = [];

        for (const row of parsedRows) {
          const rawDate = row.date;
          // Busca revenue, amount o total
          let rawAmount = row.amount ?? row.revenue ?? row.total;

          if (!rawDate || rawAmount == null) continue;

          // Limpieza de moneda ($1,200 -> 1200)
          if (typeof rawAmount === "string") {
            rawAmount = rawAmount.replace(/[$,]/g, "");
          }

          const amountNum = Number(rawAmount);
          if (isNaN(amountNum)) continue;

          salesToInsert.push({
            dataset_id: datasetId,
            date: rawDate,
            amount: amountNum,
            product: row.product || row.productname || row.item || null,
            category: row.category || row.type || null,
            customer_id: row.customerid || row.customer || null,
          });
        }

        if (salesToInsert.length === 0) {
          return reject(
            new Error("No valid rows found. Check date/amount formats."),
          );
        }

        resolve(salesToInsert);
      },
      error: (err) => reject(err),
    });
  });
}
