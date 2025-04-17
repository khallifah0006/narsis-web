const dbPromise=indexedDB.open("stories-db",1),StoryDB={saveStory:e=>new Promise(((r,o)=>{const t=indexedDB.open("stories-db",1);t.onsuccess=t=>{const s=t.target.result,n=s.transaction("stories","readwrite"),c=n.objectStore("stories").put(e);c.onsuccess=()=>{console.log("Story saved successfully:",e),r(e)},c.onerror=e=>{console.error("Error saving story:",e.target.error),o(e.target.error)},n.oncomplete=()=>s.close()},t.onerror=e=>{console.error("Error opening IndexedDB:",e.target.error),o(e.target.error)}})),deleteStory:e=>new Promise(((r,o)=>{const t=indexedDB.open("stories-db",1);t.onsuccess=t=>{const s=t.target.result,n=s.transaction("stories","readwrite"),c=n.objectStore("stories").delete(e);c.onsuccess=()=>{console.log(`Story with ID ${e} deleted!`),r()},c.onerror=r=>{console.error(`Error deleting story with ID ${e}:`,r.target.error),o(r.target.error)},n.oncomplete=()=>s.close()},t.onerror=e=>{console.error("Error opening IndexedDB:",e.target.error),o(e.target.error)}})),getStories:()=>new Promise(((e,r)=>{const o=indexedDB.open("stories-db",1);o.onsuccess=o=>{const t=o.target.result,s=t.transaction("stories","readonly"),n=s.objectStore("stories").getAll();n.onsuccess=()=>e(n.result),n.onerror=e=>r(e.target.error),s.oncomplete=()=>t.close()},o.onerror=e=>{console.error("Error opening IndexedDB:",e.target.error),r(e.target.error)}})),clearStories:()=>new Promise(((e,r)=>{const o=indexedDB.open("stories-db",1);o.onsuccess=o=>{const t=o.target.result,s=t.transaction("stories","readwrite"),n=s.objectStore("stories").clear();n.onsuccess=()=>{console.log("Stories cleared successfully"),e()},n.onerror=e=>{console.error("Error clearing stories:",e.target.error),r(e.target.error)},s.oncomplete=()=>t.close()},o.onerror=e=>{console.error("Error opening IndexedDB:",e.target.error),r(e.target.error)}}))};dbPromise.onupgradeneeded=e=>{const r=e.target.result;r.objectStoreNames.contains("stories")||r.createObjectStore("stories",{keyPath:"id"}),console.log("IndexedDB structure created!")},dbPromise.onsuccess=e=>{console.log("IndexedDB opened successfully!")},dbPromise.onerror=e=>{console.error("Error opening IndexedDB:",e.target.error)};export{StoryDB};