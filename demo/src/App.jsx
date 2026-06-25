import { Routes, Route } from 'react-router-dom'
import { ShowcaseLayout } from './ShowcaseLayout'
import { IntroPage } from './pages/IntroPage'
import { ButtonsPage } from './pages/ButtonsPage'
import { CardsPage } from './pages/CardsPage'
import { BadgesPage } from './pages/BadgesPage'
import { ModalsPage } from './pages/ModalsPage'
import { TabsPage } from './pages/TabsPage'
import { AvatarsPage } from './pages/AvatarsPage'
import { AlertsPage } from './pages/AlertsPage'
import { TimelinePage } from './pages/TimelinePage'
import { ProgressPage } from './pages/ProgressPage'
import { StatsCardsPage } from './pages/StatsCardsPage'
import { DataTablePage } from './pages/DataTablePage'
import { ChartsPage } from './pages/ChartsPage'
import { RechartsPage } from './pages/RechartsPage'
import { FormsPage } from './pages/FormsPage'
import { ChatComponentsPage } from './pages/ChatComponentsPage'
import { LayoutPage } from './pages/LayoutPage'
import { FeedbackPage } from './pages/FeedbackPage'

export default function App() {
  return (
    <Routes>
      <Route element={<ShowcaseLayout />}>
        <Route index element={<IntroPage />} />
        <Route path="buttons" element={<ButtonsPage />} />
        <Route path="cards" element={<CardsPage />} />
        <Route path="badges" element={<BadgesPage />} />
        <Route path="modals" element={<ModalsPage />} />
        <Route path="tabs" element={<TabsPage />} />
        <Route path="avatars" element={<AvatarsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="stats-cards" element={<StatsCardsPage />} />
        <Route path="datatable" element={<DataTablePage />} />
        <Route path="charts" element={<ChartsPage />} />
        <Route path="recharts" element={<RechartsPage />} />
        <Route path="forms" element={<FormsPage />} />
        <Route path="chat" element={<ChatComponentsPage />} />
        <Route path="layout" element={<LayoutPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
      </Route>
    </Routes>
  )
}
