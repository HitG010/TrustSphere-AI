import { Routes, Route } from 'react-router-dom';
import TrustSphereLayout from './components/trustSphereLayout/layout';
import ReviewAnalyzer from './pages/reviewAnalyzer';
import ImageChecker from './pages/imageChecker';
import TrustScore from './pages/trustScore';
import TrustGraph from './pages/trustGraph';

export default function App() {
  return (
    <Routes>
      <Route path="/trustsphere" element={<TrustSphereLayout />}>
        <Route path="reviewAnalyzer" element={<ReviewAnalyzer />} />
        <Route path="imageChecker" element={<ImageChecker/>}/>
        <Route path="trustScore" element={<TrustScore/>}/>
        <Route path="trustGraph" element={<TrustGraph/>}/>
      </Route>
    </Routes>
  );
}