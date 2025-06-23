import React from 'react'
import LandingNavbar from '../components/LandingNavbar';
import trustLandingBg from '../assets/trustLandingBg.png';
import trustLandingTileFeatures from '../assets/trustLandingTileFeatures.png';
import architecture_Trustsphere from '../assets/architecture_TrustSphere.png';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaGithub } from 'react-icons/fa6';

function landing() {
    return (
        <div style={{ backgroundImage: `url(${trustLandingBg})`, backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden', backgroundRepeat: 'no-repeat' }} className='w-full h-screen'>
            <div className='overflow-y-scroll w-full h-screen flex flex-col'>
                <div className="flex flex-col items-center justify-center h-screen font-semibold flex-shrink-0"
                >
                    <LandingNavbar />
                    <h1 className="text-lg mb-4 rounded rounded-full bg-white/5 border border-1 border-[#FF891070] py-0.5 px-4"><span className='font-instrument italic font-light'>From review to return — monitor it all, intelligently.</span></h1>
                    <h1 className="text-6xl mb-1"><span className='font-instrument italic font-light text-[#FF8910]'>Trust</span> Isn't Just Earned,</h1>
                    <h1 className="text-6xl mb-4">It's <span className='font-instrument italic font-light text-[#FF8910]'>Engineered!</span></h1>
                    <p className="text-center text-white/65 font-medium">
                        Your one-stop solution for analyzing reviews, checking logos, and visualizing trust graphs. <br />
                        Seamlessly integrated. Fiercely intelligent. Built for scale.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <Link to="https://github.com/HitG010/TrustSphere-AI" className="rounded-md border border-white/25 text-white px-4 py-2 rounded flex items-center gap-2 w-fit justify-center hover:bg-white/15 transition-all duration-300"><FaGithub className='w-4 h-4' /> Github</Link>
                        <Link to="/trustsphere/reviewAnalyzer" className="rounded-md border border-white/25 text-black bg-white px-4 py-2 rounded  flex items-center gap-2 w-fit justify-center hover:bg-white/65 transition-all duration-300"> Get Started <FaArrowRight className='w-4 h-4' /></Link>
                    </div>
                </div>
                <div className='mt-[-100px] flex flex-col items-center justify-center h-screen font-semibold flex-shrink-0'>
                    <img src={trustLandingTileFeatures} alt="TrustSphere AI Features" className='scale-45 h-auto rounded-lg' />
                </div>
                <div className='mt-[-100px] flex flex-col items-center justify-center h-screen font-semibold flex-shrink-0'>
                    <img src={architecture_Trustsphere} alt="TrustSphere AI Workflow" className='scale-65 h-auto rounded-lg' />
                </div>
                <footer className="w-full py-4 bg-white/10 border-t border-white/20 mt-auto flex flex-col items-center">
                    <div className="text-white/70 text-sm font-light flex flex-col items-center gap-1">
                        <span>© {new Date().getFullYear()} TrustSphere AI. All rights reserved.</span>
                        <span>
                            Made with <span className="text-[#FF8910] font-bold">♥</span> by the Team FigureOut
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default landing
