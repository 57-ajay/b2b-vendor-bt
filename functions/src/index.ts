import { setGlobalOptions } from "firebase-functions/v2";

import { REGION } from "./config";

// Region must match NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION in the app.
setGlobalOptions({ region: REGION, maxInstances: 40 });

export * from "./callables";
export * from "./triggers";
export { mockAgentSweeper } from "./mockAgent";
