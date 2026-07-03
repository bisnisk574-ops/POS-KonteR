// ============================================================
//  CLOUD FUNCTIONS — Access-Konter
//  Versi  : 1.0.0
//  Fungsi : Auto-cleanup anonymous users tidak aktif (7 hari)
//           + cleanup kasir_sessions expired
// ============================================================

const functions  = require('firebase-functions');
const admin      = require('firebase-admin');

admin.initializeApp();
const db   = admin.firestore();
const auth = admin.auth();

// ── Konstanta ──────────────────────────────────────────────
const ANON_INACTIVE_DAYS  = 30;   // anon user hapus jika tidak aktif > 30 hari
const SESSION_EXPIRED_DAYS = 2;   // kasir_sessions hapus jika > 2 hari
const BATCH_SIZE           = 100; // max delete per batch Firestore

// ============================================================
//  HELPER: hapus array UID dari Firebase Auth
// ============================================================
async function deleteAuthUsers(uids) {
  if (!uids.length) return 0;
  // deleteUsers mendukung max 1000 UID sekaligus
  const chunks = [];
  for (let i = 0; i < uids.length; i += 1000) {
    chunks.push(uids.slice(i, i + 1000));
  }
  let totalDeleted = 0;
  for (const chunk of chunks) {
    const result = await auth.deleteUsers(chunk);
    totalDeleted += result.successCount;
    if (result.failureCount > 0) {
      result.errors.forEach(e =>
        functions.logger.warn(`Gagal hapus UID ${e.index}: ${e.error.message}`)
      );
    }
  }
  return totalDeleted;
}

// ============================================================
//  HELPER: hapus koleksi Firestore berdasarkan array docId
// ============================================================
async function deleteFirestoreDocs(collectionPath, docIds) {
  if (!docIds.length) return;
  const chunks = [];
  for (let i = 0; i < docIds.length; i += BATCH_SIZE) {
    chunks.push(docIds.slice(i, i + BATCH_SIZE));
  }
  for (const chunk of chunks) {
    const batch = db.batch();
    chunk.forEach(id => batch.delete(db.collection(collectionPath).doc(id)));
    await batch.commit();
  }
}

// ============================================================
//  SCHEDULED: Cleanup setiap 7 hari (Senin 02:00 WIB)
// ============================================================
exports.weeklyCleanup = functions
  .region('asia-southeast1')           // server Singapore — dekat Indonesia
  .pubsub
  .schedule('0 19 * * 0')             // UTC 19:00 = WIB 02:00 Minggu malam
  .timeZone('Asia/Jakarta')
  .onRun(async (context) => {
    functions.logger.info('=== [Access-Konter] Weekly Cleanup Dimulai ===');

    const results = {
      anonymousDeleted : 0,
      sessionsDeleted  : 0,
      errors           : [],
    };

    // ── 1. Hapus Anonymous Users tidak aktif ───────────────
    try {
      const cutoffAnon = new Date();
      cutoffAnon.setDate(cutoffAnon.getDate() - ANON_INACTIVE_DAYS);

      const uidsToDelete = [];
      let nextPageToken;

      // Iterasi semua user (Firebase Auth tidak punya query filter langsung)
      do {
        const listResult = await auth.listUsers(1000, nextPageToken);
        for (const user of listResult.users) {
          const isAnon = user.providerData.length === 0; // anonymous = tidak ada provider
          if (!isAnon) continue;

          const lastSignIn = user.metadata.lastSignInTime
            ? new Date(user.metadata.lastSignInTime)
            : new Date(user.metadata.creationTime);

          if (lastSignIn < cutoffAnon) {
            uidsToDelete.push(user.uid);
          }
        }
        nextPageToken = listResult.pageToken;
      } while (nextPageToken);

      functions.logger.info(`Anonymous tidak aktif ditemukan: ${uidsToDelete.length} user`);

      // Hapus dari Auth
      results.anonymousDeleted = await deleteAuthUsers(uidsToDelete);

      // Hapus kasir_sessions yang mungkin dimiliki anonymous tersebut
      // (session doc ID = anonUid)
      await deleteFirestoreDocs('kasir_sessions', uidsToDelete);

      functions.logger.info(`Anonymous dihapus: ${results.anonymousDeleted}`);
    } catch (err) {
      functions.logger.error('Error cleanup anonymous:', err.message);
      results.errors.push('anonymous: ' + err.message);
    }

    // ── 2. Hapus kasir_sessions yang sudah lama expired ───
    try {
      const cutoffSession = new Date();
      cutoffSession.setDate(cutoffSession.getDate() - SESSION_EXPIRED_DAYS);
      const cutoffTs = admin.firestore.Timestamp.fromDate(cutoffSession);

      // Session dengan is_active = false DAN created_at sudah lama
      const snapInactive = await db.collection('kasir_sessions')
        .where('is_active', '==', false)
        .where('created_at', '<', cutoffTs)
        .get();

      // Session dengan is_active = true tapi sudah sangat lama (> 2 hari) — stuck/orphan
      const cutoffOrphan = new Date();
      cutoffOrphan.setDate(cutoffOrphan.getDate() - SESSION_EXPIRED_DAYS);
      const cutoffOrphanTs = admin.firestore.Timestamp.fromDate(cutoffOrphan);

      const snapOrphan = await db.collection('kasir_sessions')
        .where('created_at', '<', cutoffOrphanTs)
        .get();

      const sessionIdsToDelete = new Set();
      snapInactive.docs.forEach(d => sessionIdsToDelete.add(d.id));
      snapOrphan.docs.forEach(d => sessionIdsToDelete.add(d.id));

      const sessionArr = Array.from(sessionIdsToDelete);
      await deleteFirestoreDocs('kasir_sessions', sessionArr);
      results.sessionsDeleted = sessionArr.length;

      functions.logger.info(`kasir_sessions dihapus: ${results.sessionsDeleted}`);
    } catch (err) {
      functions.logger.error('Error cleanup sessions:', err.message);
      results.errors.push('sessions: ' + err.message);
    }

    // ── 3. Simpan log cleanup ke Firestore ────────────────
    try {
      await db.collection('cleanup_logs').add({
        run_at           : admin.firestore.FieldValue.serverTimestamp(),
        anonymous_deleted: results.anonymousDeleted,
        sessions_deleted : results.sessionsDeleted,
        errors           : results.errors,
      });
    } catch (err) {
      functions.logger.warn('Gagal simpan cleanup log:', err.message);
    }

    functions.logger.info('=== [Access-Konter] Weekly Cleanup Selesai ===', results);
    return null;
  });

// ============================================================
//  CALLABLE: Trigger manual cleanup (admin only)
//  Panggil dari app: firebase.functions().httpsCallable('manualCleanup')
// ============================================================
exports.manualCleanup = functions
  .region('asia-southeast1')
  .https.onCall(async (data, context) => {
    // Hanya admin (UID hardcode sama seperti di Firestore Rules)
    const ADMIN_UID = 'XgIW4oGLmNQZ0BIDpO6ZQfsjloB3';
    if (!context.auth || context.auth.uid !== ADMIN_UID) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Hanya admin yang boleh menjalankan cleanup manual.'
      );
    }

    functions.logger.info('[Access-Konter] Manual cleanup dipicu oleh admin');

    // Jalankan logika yang sama — reuse dengan memanggil context weeklyCleanup
    // Untuk simplicity, duplikat singkat di sini
    let anonymousDeleted = 0;
    let sessionsDeleted  = 0;

    // Hapus anon user tidak aktif > 1 hari (lebih agresif untuk manual)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1);
    const uidsToDelete = [];
    let nextPageToken;
    do {
      const list = await auth.listUsers(1000, nextPageToken);
      for (const user of list.users) {
        if (user.providerData.length > 0) continue;
        const last = user.metadata.lastSignInTime
          ? new Date(user.metadata.lastSignInTime)
          : new Date(user.metadata.creationTime);
        if (last < cutoff) uidsToDelete.push(user.uid);
      }
      nextPageToken = list.pageToken;
    } while (nextPageToken);

    anonymousDeleted = await deleteAuthUsers(uidsToDelete);
    await deleteFirestoreDocs('kasir_sessions', uidsToDelete);

    // Hapus semua inactive sessions
    const snap = await db.collection('kasir_sessions')
      .where('is_active', '==', false).get();
    const ids = snap.docs.map(d => d.id);
    await deleteFirestoreDocs('kasir_sessions', ids);
    sessionsDeleted = ids.length;

    await db.collection('cleanup_logs').add({
      run_at           : admin.firestore.FieldValue.serverTimestamp(),
      triggered_by     : 'manual_admin',
      anonymous_deleted: anonymousDeleted,
      sessions_deleted : sessionsDeleted,
    });

    return { success: true, anonymousDeleted, sessionsDeleted };
  });
