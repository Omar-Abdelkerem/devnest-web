/**
 * HomePage.jsx — Landing page assembly
 *
 * This acts as the route-level container for the landing page.
 * It strictly composes reusable UI sections in vertical order.
 */

import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Stats from '../components/Stats'

export default function HomePage() {
    return (
        <>
            <Hero />
            <HowItWorks />
            <Stats />
        </>
    )
}