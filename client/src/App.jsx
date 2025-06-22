import { Routes, Route } from 'react-router-dom';
import TrustSphereLayout from './components/trustSphereLayout/layout';
import ReviewAnalyzer from './pages/reviewAnalyzer';
import TrustGraph from './pages/trustGraph';
import LogoUpload from './pages/logoChecker';

export default function App() {
  return (
    <Routes>
      <Route path="/trustsphere" element={<TrustSphereLayout />}>
        <Route path="reviewAnalyzer" element={<ReviewAnalyzer />} />
        <Route path="logoChecker" element={<LogoUpload/>}/>
        {/* <Route path="trustScore" element={<TrustScore/>}/> */}
        <Route path="trustGraph" element={<TrustGraph/>}/>
      </Route>
    </Routes>
  );
}