/**
 * @deprecated このファイルは非推奨です。代わりに lib/supabase/index.ts からインポートしてください。
 * 例: import { fetchDataClient, insertDataClient, updateDataClient, deleteDataClient } from "./lib/supabase";
 */

import {
  fetchDataClient as fetchData,
  insertDataClient as insertData,
  updateDataClient as updateData,
  deleteDataClient as deleteData,
} from "./supabase"

console.warn("lib/supabase-client.ts は非推奨です。代わりに lib/supabase/index.ts からインポートしてください。")

export { fetchData, insertData, updateData, deleteData }
