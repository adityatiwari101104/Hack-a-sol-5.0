import { useState } from 'react'
import { AsOfBar, BackendBanner, Rail, TopBar } from './components/Shell'
import { AskPage, type AskRequest } from './pages/AskPage'
import { AuditPage } from './pages/AuditPage'
import { ConflictsPage } from './pages/ConflictsPage'
import { GovernancePage } from './pages/GovernancePage'
import { HistoryPage } from './pages/HistoryPage'
import { ImpactPage } from './pages/ImpactPage'
import { ReviewPage } from './pages/ReviewPage'
import { RulesPage } from './pages/RulesPage'
import { Landing } from './pages/Landing'
import { UploadsPage } from './pages/UploadsPage'
import { useApp, useRoute } from './state'

export default function App() {
  const [page, rest, go] = useRoute()
  const { setAsOf, setProfile, setDomain, setUploadIds, setUploadCollection } = useApp()
  const [request, setRequest] = useState<AskRequest | null>(null)
  const pick = (q: { question: string; as_of: string; profile: string; collection?: string; upload_ids?: string[]; history?: { question: string; query_id?: string }[] }) => {
    setAsOf(q.as_of)
    setProfile(q.profile)
    if (q.upload_ids?.length) { setUploadIds(q.upload_ids); setUploadCollection(q.collection ?? 'banking'); setDomain('uploads') }
    else setDomain(q.collection === 'insurance' ? 'insurance' : 'banking')
    setRequest({ ...q, nonce: Date.now() })
  }
  if (page === 'home') {
    return <Landing onStart={(r) => { pick({ question: r.q, as_of: r.as_of, profile: r.profile, collection: r.domain === 'insurance' ? 'insurance' : undefined, upload_ids: r.upload_ids }); go('ask') }} onOpen={go} />
  }
  return (
    <div className="app">
      <a className="skip" href="#main">Skip to content</a>
      <TopBar />
      <AsOfBar />
      <BackendBanner />
      <div className="body">
        <Rail onPick={pick} />
        <main id="main" className="main">
          {/* The Ask workspace stays mounted so its answer survives a trip to another screen. */}
          <div hidden={page !== 'ask'} className="main-ask"><AskPage request={request} setRequest={setRequest} /></div>
          {page === 'history' && <HistoryPage chunk={rest} />}
          {page === 'conflicts' && <ConflictsPage />}
          {page === 'impact' && <ImpactPage docParam={rest} />}
          {page === 'uploads' && <UploadsPage />}
          {page === 'review' && <ReviewPage />}
          {page === 'audit' && <AuditPage />}
          {page === 'rules' && <RulesPage />}
          {page === 'governance' && <GovernancePage />}
        </main>
      </div>
    </div>
  )
}
