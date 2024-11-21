// // src/lib/api.ts
// import { hc } from "hono/client";
// import type { ApiRoutes } from "@server/index";

// const client = hc<ApiRoutes>('/');
// export const api = client as { 
//   api: { 
//     expenses: {
//       "total-spent": {
//         $get: () => Promise<Response>
//       }
//     }
//   }
// };