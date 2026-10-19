export async function checkConnection(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    const result = await client.query(
      "SELECT 1 AS connected, current_setting('transaction_read_only') AS read_only",
    );
    const row = result.rows[0];
    if (row.connected !== 1 || row.read_only !== 'on') {
      throw new Error('DATABASE_CHECK_FAILED');
    }
    return { status: 'ok', read_only: true };
  } finally {
    try {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  }
}
