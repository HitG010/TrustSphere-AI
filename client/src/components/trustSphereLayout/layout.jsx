import { Outlet } from "react-router-dom"
import Navbar from "../navbar"

function TrustSphereLayout() {
    console.log("Layout rendered");
    
    return <div className="flex flex-col overflow-hidden">
        <Navbar/>
        <main className="flex flex-col w-full">
            <Outlet/>
        </main>
    </div>
}

export default TrustSphereLayout