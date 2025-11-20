import Papa from "papaparse";

// Tipo para la inserción en DB (alineado con tu tabla sales)
export type SaleInsert = {
  dataset_id: string;
  date: string;
  amount: number;
  product: string | null;
  category: string | null;
  customer_id: string | null;
};

// Interfaz interna para el row crudo del CSV
interface CSVRow {
  date?: string;
  amount?: string;
  revenue?: string;
  total?: string;
  product?: string;
  productname?: string;
  item?: string;
  category?: string;
  type?: string;
  customerid?: string;
  customer?: string;
  [key: string]: string | undefined;
}

/**
 * Parsea un string CSV, valida columnas y devuelve objetos listos para insertar.
 * Funciona tanto en Cliente como en Servidor (Node.js).
 */
export function parseAndValidateCsvContent(
  csvContent: string,
  datasetId: string,
): Promise<SaleInsert[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) =>
        h
          .toLowerCase()
          .trim()
          .replace(/[\s_]+/g, ""),
      complete: (results) => {
        const rows = results.data as CSVRow[];

        if (!rows || rows.length === 0) {
          return reject(new Error("The CSV file is empty."));
        }

        // 1. Validación de Cabeceras
        const firstRow = rows[0];
        const hasDate = "date" in firstRow;
        const hasAmount =
          "amount" in firstRow || "revenue" in firstRow || "total" in firstRow;

        if (!hasDate || !hasAmount) {
          return reject(
            new Error(
              "CSV must contain 'date' and 'amount' (or 'revenue') columns.",
            ),
          );
        }

        // 2. Mapeo y Sanitización
        const validSales: SaleInsert[] = [];

        for (const row of rows) {
          const rawDate = row.date;
          let rawAmount = row.amount ?? row.revenue ?? row.total;

          if (!rawDate || rawAmount == null) continue;

          // Limpieza de moneda ($1,200 -> 1200)
          if (typeof rawAmount === "string") {
            rawAmount = rawAmount.replace(/[$,]/g, "");
          }

          const amountNum = Number(rawAmount);
          if (isNaN(amountNum)) continue;

          validSales.push({
            dataset_id: datasetId,
            date: rawDate, // Supabase maneja bien strings ISO YYYY-MM-DD
            amount: amountNum,
            product: row.product || row.productname || row.item || null,
            category: row.category || row.type || null,
            customer_id: row.customerid || row.customer || null,
          });
        }

        if (validSales.length === 0) {
          return reject(new Error("No valid rows found in CSV after parsing."));
        }

        resolve(validSales);
      },
      error: (err: Error) => reject(err),
    });
  });
}
