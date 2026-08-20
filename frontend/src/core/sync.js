import { openDB } from './db';
import { apiCall } from './api';

export async function processSyncQueue() {
  if (!navigator.onLine) return;
  const db = await openDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  const store = tx.objectStore('syncQueue');
  const req = store.getAll();
  
  req.onsuccess = async () => {
    const items = req.result;
    for (const item of items) {
      try {
        await apiCall(item.action, item.payload);
        const delTx = db.transaction('syncQueue', 'readwrite');
        delTx.objectStore('syncQueue').delete(item.id);
      } catch (e) {
        console.error('Sync failed for item', item, e);
      }
    }
  };
}

window.addEventListener('online', processSyncQueue);
