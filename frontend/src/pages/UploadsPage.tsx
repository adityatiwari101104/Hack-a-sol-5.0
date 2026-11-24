// "My uploads": the PDFs you added (GET /documents?source=upload), which of them answers may use, their ingest
// reports, and delete. The shipped demo sets (insurance) are listed by the API as uploads too; they are left out here
// because they cannot be deleted (403) and are chosen with the Insurance domain instead.
import { useCallback, useEffect, useState } from 'react'
import { api, ApiError, type UploadRow, type UploadStatus } from '../api'
import { IDoc, IUpload } from '../components/Icons'
import { Empty, Spinner } from '../components/primitives'
import { demoFile, kindLabel, UploadDialog } from '../components/Upload'
import { fmtDate, fmtDateTime } from '../lib/format'
import { useApp, useRoute } from '../state'

/** Choose uploads for answers. Uploads of another collection replace the selection (the API answers from one collection). */
export function useUploadPick() {
  const { uploadIds, setUploadIds, setUploadCollection, uploadCollection, setDomain } = useApp()
  const [, , go] = useRoute()
  const toggle = (id: string, collection: string) => {
    if (collection !== uploadCollection) { setUploadCollection(collection); setUploadIds([id]); return }
    setUploadIds(uploadIds.includes(id) ? uploadIds.filter((x) => x !== id) : [...uploadIds, id])
  }
  const askAbout = (id: string, collection: string) => {
    if (collection !== uploadCollection || !uploadIds.includes(id)) {
      setUploadCollection(collection)
      setUploadIds(collection !== uploadCollection ? [id] : [...uploadIds.filter((x) => x !== id), id])
    }
    setDomain('uploads')
    go('ask')
  }
  return { toggle, askAbout }
}

export function UploadsPage() {
  const { actor, uploadIds, setUploadIds, features, apiState } = useApp()
  const { toggle, askAbout } = useUploadPick()
  const [rows, setRows] = useState<UploadRow[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [dlg, setDlg] = useState<{ preset?: { file: File; doc_kind: string } | null; showDocId?: string | null } | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [demoErr, setDemoErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [up, demo] = await Promise.all([api.uploads(), api.docsBySource('demo').catch(() => [] as { doc_id: string }[])])
      const demoIds = new Set(demo.map((d) => d.doc_id))
      setRows(up.filter((r) => !demoIds.has(r.doc_id)))
      setErr(null)
    } catch (e) { setErr((e as Error).message) }
  }, [])
  useEffect(() => { if (apiState === 'up') load() }, [load, apiState])
  // forget selected ids that no longer exist (deleted elsewhere)
  useEffect(() => { if (rows) { const ids = new Set(rows.map((r) => r.doc_id)); if (uploadIds.some((i) => !ids.has(i))) setUploadIds(uploadIds.filter((i) => ids.has(i))) } }, [rows]) // eslint-disable-line react-hooks/exhaustive-deps

  const tryDemo = async () => {
    setDemoErr(null)
    try { setDlg({ preset: { file: await demoFile(), doc_kind: 'bank_policy' } }) } catch (e) { setDemoErr((e as Error).message) }
  }
  const del = async (id: string) => {
    setConfirm(null)
    try {
      const r = await api.deleteDoc(id, actor)
      const rm = r.removed ?? {}
      setNote(`Deleted ${id}: ${rm.chunks ?? 0} passages, ${rm.value_tuples ?? 0} values and ${rm.edges ?? 0} links removed${r.validity_restored ? '; validity changes it made were undone' : ''}. Logged in the audit chain as upload_deleted.`)
      setUploadIds(uploadIds.filter((x) => x !== id))
      load()
    } catch (e) {
      const st = e instanceof ApiError ? e.status : 0
      setNote(st === 403 ? 'Only your uploads can be deleted; the shipped corpus and demo sets are read-only.' : st === 409 ? 'It is still being processed. Delete it when it is ready.' : (e as Error).message)
    }
  }
  const onAsk = (st: UploadStatus) => { setDlg(null); askAbout(st.doc_id, st.collection ?? 'banking') }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-h">Your uploads</h1>
          <p className="page-sub">Add a circular, policy, agreement or KFS. It is redacted, indexed and checked against every document in force, and you see its conflicts before anyone relies on it. Answers use an upload only when you tick it here or choose <b>Your uploads</b> at the top.</p>
        </div>
        <div className="upl-top-actions">
          <button type="button" className="btn btn-quiet" onClick={tryDemo} disabled={apiState === 'up' && !features.upload}>Try the demo upload</button>
          <button type="button" className="btn btn-primary" onClick={() => setDlg({})} disabled={apiState === 'up' && !features.upload}><IUpload size={14} /> Upload PDF</button>
        </div>
      </header>
      {apiState === 'up' && !features.upload && <div className="errnote">This backend has no upload endpoint (POST /documents). Update the backend to use uploads.</div>}
      {demoErr && <div className="errnote" role="alert">{demoErr}</div>}
      {note && <div className="okline" role="status">{note}</div>}
      {err && <div className="errnote" role="alert">{err}</div>}

      {!rows && !err ? <div className="upl-wait"><Spinner /> Loading…</div> : rows && rows.length === 0 ? (
        <Empty title="No uploads yet">
          <p>Try the demo: a fictional bank circular, EUCB/CR/2026/07, that sets a 3% foreclosure charge. RBI ¶261(1) forbids it for floating-rate loans to individuals, and the upload report shows both quotes side by side.</p>
          <button type="button" className="btn btn-primary" onClick={tryDemo}>Try the demo upload</button>
        </Empty>
      ) : rows && (
        <table className="tbl upl-tbl">
          <thead><tr><th scope="col" className="upl-c-use">Use in answers</th><th scope="col">Document</th><th scope="col">Type</th><th scope="col">In force from</th><th scope="col">Pages</th><th scope="col">Added</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const ready = r.status === 'ready'
              return (
                <tr key={r.doc_id} className={uploadIds.includes(r.doc_id) ? 'on' : ''}>
                  <td className="upl-c-use"><input type="checkbox" checked={uploadIds.includes(r.doc_id)} disabled={!ready} onChange={() => toggle(r.doc_id, r.collection)} aria-label={`Use ${r.title} in answers`} /></td>
                  <td>
                    <div className="upl-name"><IDoc size={13} /> {r.title}</div>
                    <div className="upl-sub"><span className="mono">{r.doc_id}</span>{r.collection === 'general' && ' · answered on its own'}{!ready && <> · <b>{r.status === 'failed' ? 'failed' : `${r.stage}…`}</b></>}{(r.ocr_pages?.length ?? 0) > 0 && <> · OCR on {r.ocr_pages!.length} page{r.ocr_pages!.length === 1 ? '' : 's'}</>}</div>
                  </td>
                  <td>{kindLabel(r.doc_kind)}</td>
                  <td className="tnum">{r.effective_date ? fmtDate(r.effective_date) : '—'}</td>
                  <td className="tnum">{r.n_pages ?? '—'}</td>
                  <td className="tnum">{r.ingested_at ? fmtDateTime(r.ingested_at) : '—'}</td>
                  <td className="upl-c-act">
                    {confirm === r.doc_id ? (
                      <span className="upl-confirm">Delete for everyone? This cannot be undone. <button type="button" className="btn btn-danger" onClick={() => del(r.doc_id)}>Delete</button> <button type="button" className="btn btn-quiet" onClick={() => setConfirm(null)}>Keep</button></span>
                    ) : (
                      <>
                        {ready && <button type="button" className="btn btn-quiet" onClick={() => askAbout(r.doc_id, r.collection)}>Ask</button>}
                        <button type="button" className="btn btn-quiet" onClick={() => setDlg({ showDocId: r.doc_id })}>Report</button>
                        <button type="button" className="btn btn-quiet" onClick={() => setConfirm(r.doc_id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <UploadDialog open={!!dlg} preset={dlg?.preset} showDocId={dlg?.showDocId} onAsk={onAsk} onClose={() => { setDlg(null); load() }} />
    </div>
  )
}
