import { openDB } from "idb";

const DB_NAME = "reynaldtrack-db";
const STORE_NAME = "transactions";

export const db = await openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  },
});

export async function getAllTransactions() {
  return await db.getAll(STORE_NAME);
}

export async function addTransactionDB(transaction: any) {
  await db.put(STORE_NAME, transaction);
}

export async function removeTransactionDB(id: string) {
  await db.delete(STORE_NAME, id);
}
