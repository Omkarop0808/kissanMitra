import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import CropCare from './pages/CropCare'
import FarmerAssistant from './pages/FarmerAssistant'
import MarketAnalysis from './pages/MarketAnalysis'
import WeatherAdvisory from './pages/WeatherAdvisory'
import WaterFootprint from './pages/WaterFootprint'
import Schemes from './pages/Schemes'
import EquipmentRental from './pages/EquipmentRental'
import WasteExchange from './pages/WasteExchange'
import Donation from './pages/Donation'
import Education from './pages/Education'
import Community from './pages/Community'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crop-care" element={<CropCare />} />
        <Route path="/farmer-assistant" element={<FarmerAssistant />} />
        <Route path="/market-analysis" element={<MarketAnalysis />} />
        <Route path="/weather-advisory" element={<WeatherAdvisory />} />
        <Route path="/water-footprint" element={<WaterFootprint />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/equipment-rental" element={<EquipmentRental />} />
        <Route path="/waste-exchange" element={<WasteExchange />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/education" element={<Education />} />
        <Route path="/community" element={<Community />} />
      </Route>
    </Routes>
  )
}

export default App
