import { a8 as useRouter, W as reactExports, J as isRedirect, M as jsxRuntimeExports, T as TSS_SERVER_FUNCTION, z as getServerFnById, j as createServerFn } from "./server-CUL67baf.js";
import { c as cn } from "./button-8Tq0xP8B.js";
import { r as requireSupabaseAuth } from "./auth-middleware-dcQ7tGdu.js";
import { o as objectType, s as stringType, a as arrayType, n as numberType, e as enumType } from "./types-BmuyU1df.js";
function useServerFn(serverFn) {
  const router = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("animate-pulse rounded-md bg-primary/10", className), ...props });
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getCertificateById = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("a5f8191c061eef085e832b88092ca0cea9306ce682577654acc0aa55e7f30368"));
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
const saveCertificate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => SaveSchema.parse(d)).handler(createSsrRpc("40231a8ffb249329c4f131b01f7ca08fba8aca04117fbe67b6fbd9ab733c3a97"));
const listCertificates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("10f57222019212bf58a7803a54bec6ba5076706abb520db31f0b1ec0f3196453"));
const deleteCertificate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("8cd090356b5e4179cedcbf935ad82e8141cba85202c6c1daca386983aa3b223c"));
export {
  Skeleton as S,
  createSsrRpc as c,
  deleteCertificate as d,
  getCertificateById as g,
  listCertificates as l,
  saveCertificate as s,
  useServerFn as u
};
