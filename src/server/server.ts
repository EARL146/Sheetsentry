/**
 * SheetSentry Backend Server Bootstrapper
 */

import 'dotenv/config';
import { app } from './app';
import { getDb } from './database/dbInterface';

const PORT = parseInt(process.env.PORT || '4000', 10);

app.listen(PORT, async () => {
  const db = getDb();
  const ok = await db.ping();
  // eslint-disable-next-line no-console
  console.log(
    `SheetSentry Backend API listening on http://127.0.0.1:${PORT} | DB (${
      db.isLive() ? 'MySQL 8' : 'Memory'
    }): ${ok ? 'CONNECTED' : 'UNREACHABLE'}`
  );
});
