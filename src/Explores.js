import React, {useEffect, useState} from "react";
import ActionCards from "./ActionCardPage";

function Explores({dataDir, dataSources, handleDataSourceChange}) {
    const exploreSources = [
        'data/explores/explores.json',
    ];

    const [exploreData, setData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            let loadedData = [];

            // Loop through all the data sources and fetch them
            for (let source of exploreSources) {
                try {
                    const response = await fetch(dataDir + source);
                    const json = await response.json();
                    loadedData = [...loadedData, ...json];
                } catch (error) {
                    console.error(`Error fetching explore data from ${source}:`, error);
                }
            }
            setData(loadedData);
        }

        fetchData();
    }, [dataSources]);

    const formatExploreText = (text) => {
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

// Set to track unique card names and an object to track counts
    const seenCardNamesExplores = new Set();
    const cardCountExplores = {};
    const getBaseAlias = (alias) => {
        if (typeof alias === 'string') {
            return alias.replace(/\d+$/, ''); // Remove trailing digits if alias is a valid string
        }
        return ''; // Return an empty string or handle undefined alias as needed
    };

// Filter and count the data in one step
    const filteredDataExplores = exploreData.filter(exploreCard => {
        const baseAlias = getBaseAlias(exploreCard.id);
        // Check if the card's source matches any of the selected expansions
        const isFromSelectedSource = (
            (dataSources.basePok && (exploreCard.source === 'base' ||
                exploreCard.source === 'codex1' || exploreCard.source === 'pok')) ||
            (dataSources.keleres && exploreCard.source === 'codex2') ||
            (dataSources.keleres && exploreCard.source === 'codex3') ||
            (dataSources.discordantStars && exploreCard.source === 'ds')
        );
        // If the card is not from the selected sources, ignore it
        if (!isFromSelectedSource) return false; // Filter out cards not from the selected sources
        // Count how many times each base alias appears from the selected sources
        if (!cardCountExplores[baseAlias]) {
            cardCountExplores[baseAlias] = 1; // Initialize count for this base alias
        } else {
            cardCountExplores[baseAlias]++; // Increment count for this base alias
        }

        // Ensure we only include the first occurrence of each base alias
        if (seenCardNamesExplores.has(baseAlias)) {
            return false; // Skip if we've already added this base alias
        }

        // Mark this base alias as seen and include it in the filtered data
        seenCardNamesExplores.add(baseAlias);
        return true;
    });

    console.log(cardCountExplores)
    return (
        <div className="grid-container">
            {filteredDataExplores.map((exploreCard) => {
                const typeImageSrc = `${dataDir}general/${exploreCard.type}.png`;
                console.log(typeImageSrc);
                return (
                    <div key={exploreCard.flavorText} className="grid-item">
                        <div className="card-text">
                            <div className="card-title">
                                <span style={{fontWeight: 'bold', fontSize: '14pt'}}>{exploreCard.name}</span>
                                <div className="card-corner">
                                    <div className="card-count">
                                        {/* Only display the card count if it's greater than 1 */}
                                        {cardCountExplores[getBaseAlias(exploreCard.id)] > 1 && (
                                            <div className="card-count">
                                                {cardCountExplores[getBaseAlias(exploreCard.id)]}x
                                            </div>
                                        )}
                                    </div>
                                    <img
                                        src={typeImageSrc}
                                        alt={`(${exploreCard.type})`}
                                        className="card-type-image"
                                    />
                                </div>
                            </div>
                            <br/>
                            {formatExploreText(exploreCard.text)}<br/>
                        </div>
                        <br/>
                        <em className="flavor-text">{exploreCard.flavorText}</em>
                    </div>
                );
            })}
        </div>
    );
}
export default Explores;