import React, {useEffect, useState} from "react";

function LegendaryPlanets({ dataDir, dataSources, handleDataSourceChange}) {

    const [planetData, setPlanetData] = useState([]);
    useEffect(() => {
        async function fetchPlanetData() {
            try{
                const url = dataDir + 'planet_legendary.json'
                const planets = await fetch(url).then(r => r.json());
                setPlanetData(planets);
            } catch (e) {
                console.error('Error loading planets:', e);
            }
        }
        fetchPlanetData();
    }, [dataSources]);

    const filteredDataPlanets = planetData.filter(planetCard => {
        // Check if the card's source matches any of the selected expansions
        const isFromSelectedSource = (
            (dataSources.basePok && (planetCard.source === 'base' ||
                planetCard.source === 'codex1' || planetCard.source === 'pok')) ||
            (dataSources.keleres && planetCard.source === 'codex2') ||
            (dataSources.keleres && planetCard.source === 'codex3') ||
            (dataSources.keleres && planetCard.source === 'codex4') ||
            (dataSources.discordantStars && (planetCard.source === 'ds' || planetCard.source === 'uncharted_space')) ||
            (dataSources.thunders_edge && planetCard.source === 'thunders_edge')
        );

        const isExcluded = (planetCard.id ==="phantasm" ||
            planetCard.id ==="lockedmallice" ||
            planetCard.id ==="illusion" ||
            planetCard.id === "ordinianc4")

        const isFaction = (planetCard.planetType ==="FACTION")
        // If the card is not from the selected sources, ignore it
        if (!isFromSelectedSource || isExcluded || isFaction) return false; // Filter out cards not from the selected sources

        return true;
    });

    const formatAbilityText = (text) => {
        if (!text) return null;

        // Check if the text starts with "ACTION:" and bold it
        if (text.includes("ACTION:")) {
            // Split the text at "ACTION:"
            const [beforeAction, afterAction] = text.split("ACTION:");

            return (
                <span>
                    <p>
                {beforeAction} </p>
                    <strong>ACTION:</strong><br />
                    {afterAction}
            </span>
            );
        }
        if (text.startsWith("Action:")) {
            return (
                <>
                    <strong>ACTION:</strong><br/> {text.slice(7)} {/* Remove "ACTION:" and display the rest */}
                </>
            );
        } else if (text.startsWith("ATTACH:")) {
            return (
                <>
                    <strong>ATTACH:</strong><br/> {text.slice(7)} {/* Remove "ACTION:" and display the rest */}
                </>
            );
        }

        return <>{text}</>;
    };

    return (
        <div className="grid-container">
            {filteredDataPlanets.map((planetCard) => {
                return (
                    <div key={planetCard.id} className="grid-item">
                        <div className="card-text">
                            <div className="card-title">
                                <span style={{fontWeight: 'bold', fontSize: '14pt'}}>{planetCard.name}</span><br/>
                                <div className='card-corner'>
                                    <img
                                        src={dataDir + 'TI4_map_generator_bot/src/main/resources/general/Legendary_complete.png'}
                                        className="card-type-image"
                                    />
                                </div>
                            </div>
                            <i>{planetCard.legendaryAbilityName}</i><br/><br/>
                            {formatAbilityText(planetCard.legendaryAbilityText)}<br/>
                        </div>
                        <br/>
                        <em className="flavor-text">{planetCard.legendaryAbilityFlavourText}</em>
                    </div>
                );
            })}
        </div>
    );
}
export default LegendaryPlanets;