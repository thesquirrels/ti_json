import {Link, useLocation} from 'react-router-dom';
import React, {useEffect, useLayoutEffect, useState} from "react"; // Use Routes instead of Switch
import './App.css';

// The FactionList component will handle listing and linking to factions
function FactionList({ factions, renderFactionDecal, dataSources, handleDataSourceChange }) {
    // Show a list of factions if no faction is selected
    const baseFactions = factions.filter(faction => faction.source === 'base');
    const pokFactions = factions.filter(faction => faction.source === 'pok');
    const keleresFactions = factions.filter(faction => faction.source === 'codex3');
    const discordantStarsFactions = factions.filter(faction => faction.source === 'ds');
    const [isMobileView, setIsMobileView] = useState(false); // State to track mobile view

    // Function to detect mobile view
    const handleResize = () => {
        setIsMobileView(window.innerWidth <= 768); // Adjust the width as per your layout needs
    };

    useEffect(() => {
        // Add event listener to window resize to track changes
        window.addEventListener('resize', handleResize);
        handleResize(); // Call it initially to set the correct view

        // Clean up the event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const location = useLocation(); // This hook gives you the current route information

    useLayoutEffect(() => {
        const isMobile = window.innerWidth <= 768; // Check if it's mobile
        if (isMobile) {
            // Wait for faction content to be rendered and scroll smoothly
            window.scrollTo({
                top: 260, // Scroll to 200px down
                behavior: 'smooth' // Enable smooth scrolling
            });
        }
    }, [location]); // Dependency array now includes 'location', so this effect runs on route changes

    // Reusable function to render a list of factions
    function renderFactionList(factionData, title, renderFactionDecal) {
        if (factionData.length === 0) return null; // If no factions, don't render anything
        return (
            <div style={{ breakInside: 'avoid' }}>
                <h3 style={{ margin: 0, padding: '0px 0' }}>{title}</h3>
                <ul>
                    {factionData.map(faction => (
                        <li key={faction.alias} style={{ cursor: 'pointer', listStyle: 'none' }}>
                            <Link
                                to={`/factions/${faction.source}/${faction.alias}`} // Use both source and alias in the URL
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                {renderFactionDecal(faction.alias)} {faction.factionName}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div className="App">
            <div className="faction-list">
                {renderFactionList(baseFactions, 'Base Factions', renderFactionDecal)}
                {renderFactionList(pokFactions, 'PoK Factions', renderFactionDecal)}
                {renderFactionList(keleresFactions, 'Keleres', renderFactionDecal)}
                {renderFactionList(discordantStarsFactions, 'Discordant Stars Factions', renderFactionDecal)}
            </div>
        </div>
    );
}

export default FactionList;
