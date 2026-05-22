import { c as createServerRpc } from "./createServerRpc-eurll9PQ.js";
import { j as createServerFn } from "./server-CUL67baf.js";
import { r as requireSupabaseAuth } from "./auth-middleware-dcQ7tGdu.js";
import { c as createClient } from "./index-DdGN5IVl.js";
import { o as objectType, s as stringType, a as arrayType, n as numberType, e as enumType } from "./types-BmuyU1df.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      ...!SUPABASE_URL ? ["SUPABASE_URL"] : [],
      ...!SUPABASE_SERVICE_ROLE_KEY ? ["SUPABASE_SERVICE_ROLE_KEY"] : []
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
let _supabaseAdmin;
const supabaseAdmin = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  }
});
const getCertificateById_createServerFn_handler = createServerRpc({
  id: "a5f8191c061eef085e832b88092ca0cea9306ce682577654acc0aa55e7f30368",
  name: "getCertificateById",
  filename: "src/lib/certificates.functions.ts"
}, (opts) => getCertificateById.__executeServer(opts));
const getCertificateById = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(getCertificateById_createServerFn_handler, async ({
  data
}) => {
  const {
    data: row,
    error
  } = await supabaseAdmin.from("certificates").select("id,video_id,video_title,channel,thumbnail_url,difficulty,score,total_questions,topics,recipient_name,created_at").eq("id", data.id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error("Certificate not found");
  return {
    certificate: row
  };
});
const SaveSchema = objectType({
  video_id: stringType().min(1).max(20),
  video_title: stringType().min(1).max(500),
  channel: stringType().max(200).optional().nullable(),
  thumbnail_url: stringType().url().optional().nullable(),
  difficulty: enumType(["beginner", "intermediate", "expert"]),
  score: numberType().int().min(0).max(100),
  total_questions: numberType().int().min(1).max(100),
  topics: arrayType(stringType().max(80)).max(20).default([]),
  recipient_name: stringType().min(1).max(120)
});
const saveCertificate_createServerFn_handler = createServerRpc({
  id: "40231a8ffb249329c4f131b01f7ca08fba8aca04117fbe67b6fbd9ab733c3a97",
  name: "saveCertificate",
  filename: "src/lib/certificates.functions.ts"
}, (opts) => saveCertificate.__executeServer(opts));
const saveCertificate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => SaveSchema.parse(d)).handler(saveCertificate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("certificates").insert({
    ...data,
    user_id: userId
  }).select().single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const listCertificates_createServerFn_handler = createServerRpc({
  id: "10f57222019212bf58a7803a54bec6ba5076706abb520db31f0b1ec0f3196453",
  name: "listCertificates",
  filename: "src/lib/certificates.functions.ts"
}, (opts) => listCertificates.__executeServer(opts));
const listCertificates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listCertificates_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("certificates").select("*").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return {
    certificates: data ?? []
  };
});
const deleteCertificate_createServerFn_handler = createServerRpc({
  id: "8cd090356b5e4179cedcbf935ad82e8141cba85202c6c1daca386983aa3b223c",
  name: "deleteCertificate",
  filename: "src/lib/certificates.functions.ts"
}, (opts) => deleteCertificate.__executeServer(opts));
const deleteCertificate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteCertificate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("certificates").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteCertificate_createServerFn_handler,
  getCertificateById_createServerFn_handler,
  listCertificates_createServerFn_handler,
  saveCertificate_createServerFn_handler
};
