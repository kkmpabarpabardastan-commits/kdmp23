// ============================================================
// KDMP - Google Sheets Sync Edge Function
// ============================================================
//
// FUNGSI INI: Mengirim data transaksi dari database Supabase
// ke Google Spreadsheet untuk pencatatan eksternal.
//
// ============================================================
// CARA SETUP - BACA INI SEBELUM MENGGUNAKAN:
// ============================================================
//
// 1. Buat Google Service Account:
//    - Buka https://console.cloud.google.com/
//    - Buat project baru atau pilih project yang ada
//    - Enable "Google Sheets API" (APIs & Services > Library)
//    - Buat Service Account (IAM & Admin > Service Accounts)
//    - Buat JSON key dan download file-nya
//
// 2. Dapatkan Spreadsheet ID:
//    - Buka Google Spreadsheet yang ingin digunakan
//    - Lihat URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
//    - Salin SPREADSHEET_ID dari URL tersebut
//
// 3. Bagikan Spreadsheet ke Service Account:
//    - Buka Spreadsheet Anda
//    - Klik "Share" / "Bagikan"
//    - Masukkan email Service Account (xxx@xxx.iam.gserviceaccount.com)
//    - Berikan akses "Editor"
//
// 4. Set SECRET di Supabase Dashboard:
//    - Buka Supabase Dashboard > Edge Functions > Secrets
//    - Tambahkan secret berikut:
//      GOOGLE_SERVICE_ACCOUNT_EMAIL = "xxx@xxx.iam.gserviceaccount.com"
//      GOOGLE_PRIVATE_KEY           = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
//      GOOGLE_SPREADSHEET_ID        = "SPREADSHEET_ID_ANDA"
//
// ============================================================
// TANDAI BAGIAN YANG PERLU ANDA ISI:
//    >>> [ISI DI SINI] <<<  = bagian yang perlu Anda lengkapi
// ============================================================

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TransactionRow {
  id: string;
  type: string;
  description: string | null;
  amount: number;
  member_name: string | null;
  product_name: string | null;
  quantity: number | null;
  transaction_date: string;
  status: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // ============================================================
    // >>> [ISI DI SINI] - KREDENSIAL GOOGLE SHEETS ANDA <<<
    // ============================================================
    // Cara A (RECOMMENDED): Set sebagai Supabase Edge Function Secrets
    //   - GOOGLE_SERVICE_ACCOUNT_EMAIL
    //   - GOOGLE_PRIVATE_KEY
    //   - GOOGLE_SPREADSHEET_ID
    //
    // Cara B (UNTUK TESTING): Isi langsung di bawah ini
    //   Ganti string kosong dengan nilai dari Google Service Account JSON
    // ============================================================

    const serviceAccountEmail =
      Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL") ??
      ""; // >>> [ISI DI SINI] contoh: "kdmp@my-project.iam.gserviceaccount.com"

    const privateKeyRaw =
      Deno.env.get("GOOGLE_PRIVATE_KEY") ??
      ""; // >>> [ISI DI SINI] contoh: "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

    const spreadsheetId =
      Deno.env.get("GOOGLE_SPREADSHEET_ID") ??
      ""; // >>> [ISI DI SINI] contoh: "1abc123def456ghi789jkl012mno345pqr678stu901vwx234"

    // ============================================================
    // VALIDASI: Cek apakah kredensial sudah diisi
    // ============================================================
    if (!serviceAccountEmail || !privateKeyRaw || !spreadsheetId) {
      return new Response(
        JSON.stringify({
          error:
            "Kredensial Google Sheets belum diisi. " +
            "Lihat petunjuk di file supabase/functions/sync-google-sheets/index.ts " +
            "dan isi GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, " +
            "dan GOOGLE_SPREADSHEET_ID sebagai Edge Function Secrets " +
            "atau langsung di kode.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format private key (handle escape sequences)
    const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

    // ============================================================
    // AMBIL DATA TRANSAKSI DARI SUPABASE
    // ============================================================
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: transactions, error: trxError } = await supabase
      .from("transactions")
      .select("*, member:members(name), product:products(name)")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (trxError) {
      return new Response(
        JSON.stringify({ error: "Gagal mengambil data transaksi: " + trxError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================================
    // DAPATKAN GOOGLE OAuth2 ACCESS TOKEN (JWT)
    // ============================================================
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = { alg: "RS256", typ: "JWT" };
    const jwtPayload = {
      iss: serviceAccountEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    // Encode JWT
    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(jwtHeader)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const payloadB64 = btoa(JSON.stringify(jwtPayload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const unsignedJwt = `${headerB64}.${payloadB64}`;

    // Sign JWT with private key
    const keyData = await crypto.subtle.importKey(
      "pkcs8",
      strToAb(removePemHeaders(privateKey)),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keyData, encoder.encode(unsignedJwt));
    const signatureB64 = abToB64(signature).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const signedJwt = `${unsignedJwt}.${signatureB64}`;

    // Exchange JWT for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: signedJwt,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return new Response(
        JSON.stringify({ error: "Gagal autentikasi ke Google: " + errText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken: string = tokenData.access_token;

    // ============================================================
    // KIRIM DATA KE GOOGLE SPREADSHEET
    // ============================================================
    const sheetRange = "Transaksi!A1";

    // Siapkan header baris + data baris
    const headerRow = [
      "ID",
      "Tanggal",
      "Jenis",
      "Deskripsi",
      "Anggota",
      "Produk",
      "Jumlah Barang",
      "Jumlah (Rp)",
      "Status",
    ];

    const dataRows: (string | number)[][] = transactions.map((t: TransactionRow) => [
      t.id,
      t.transaction_date,
      t.type,
      t.description ?? "",
      t.member_name ?? "",
      t.product_name ?? "",
      t.quantity ?? "",
      Number(t.amount),
      t.status,
    ]);

    const values = [headerRow, ...dataRows];

    // Clear existing data and write new data
    const clearResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transaksi!A1:I100000:clear`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!clearResponse.ok) {
      const errText = await clearResponse.text();
      return new Response(
        JSON.stringify({ error: "Gagal menghapus data lama di spreadsheet: " + errText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Write new data
    const writeResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transaksi!A1`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: values,
        }),
        // @ts-ignore: query param
      },
      // Add valueInputOption as URL query
    );

    // Retry with query param if needed
    const writeResponse2 = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transaksi!A1?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: values,
        }),
      }
    );

    if (!writeResponse2.ok) {
      const errText = await writeResponse2.text();
      return new Response(
        JSON.stringify({ error: "Gagal menulis data ke spreadsheet: " + errText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================================
    // SUKSES
    // ============================================================
    return new Response(
      JSON.stringify({
        success: true,
        synced: transactions.length,
        message: `${transactions.length} transaksi berhasil disinkronkan ke Google Spreadsheet.`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan: " + errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function removePemHeaders(pem: string): string {
  return pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function strToAb(str: string): ArrayBuffer {
  // Convert base64 string to ArrayBuffer
  const binaryString = atob(str);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function abToB64(ab: ArrayBuffer): string {
  const bytes = new Uint8Array(ab);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
