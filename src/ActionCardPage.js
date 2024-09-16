import React, {useEffect, useState} from "react";
import Agendas from "./AgendasPage";

function ActionCards({dataDir, dataSources, handleDataSourceChange}) {

    const actionCardSources = [
        'data/action_cards/action_cards.json',
    ];

    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            let loadedData = [];

            // Loop through all the data sources and fetch them
            for (let source of actionCardSources) {
                try {
                    const response = await fetch(dataDir + source);
                    const json = await response.json();
                    loadedData = [...loadedData, ...json];
                } catch (error) {
                    console.error(`Error fetching data from ${source}:`, error);
                }
            }
            setData(loadedData);
        }

        fetchData();
    }, [actionCardSources]);

    // List of card names to include even if they are duplicates
    const inclusionList = [
        'Flank Speed', 'Sabotage', 'War Machine', 'Diplomatic Pressure', 'Direct Hit',
        'Maneuvering Jets', 'Morale Boost', 'Shields Holding', 'Skilled Retreat'
    ];

    // Set to track unique card names
    const seenCardNames = new Set();
    const cardCount = {};

    const filteredActionCardData = data.filter(actionCard => {
        // Check if the card's source matches any of the selected expansions
        const isFromSelectedSource = (
            (dataSources.basePok && (actionCard.source === 'base' ||
                actionCard.source === 'codex1' || actionCard.source === 'pok')) ||
            (dataSources.keleres && actionCard.source === 'codex2') ||
            (dataSources.keleres && actionCard.source === 'codex3') ||
            (dataSources.discordantStars && actionCard.source === 'ds')
        );
        // If the card is not from the selected sources, ignore it
        if (!isFromSelectedSource) return false; // Filter out cards not from the selected sources
        // Count how many times each base alias appears from the selected sources
        if (!cardCount[actionCard.name] && inclusionList.includes(actionCard.name)) {
            cardCount[actionCard.name] = 1; // Initialize count for this base alias
        } else {
            cardCount[actionCard.name]++; // Increment count for this base alias
        }

        // Ensure we only include the first occurrence of each base alias
        if (seenCardNames.has(actionCard.name)) {
            return false; // Skip if we've already added this base alias
        }

        // Mark this base alias as seen and include it in the filtered data
        seenCardNames.add(actionCard.name);
        return true;
    });

    return (
        <div>
        <div className="grid-container">
                {filteredActionCardData.map((actionCard) => (
                    <div key={actionCard.flavorText} className="grid-item">
                        <div className="card-text">
                            <div className="card-title">
                                {/* Render the card name and other details */}
                                <div className="card-name">
                                    <span style={{fontWeight: 'bold', fontSize: '14pt'}}>{actionCard.name}</span><br/>
                                    ({actionCard.phase} Phase)<br/>
                                </div>
                                {inclusionList.includes(actionCard.name) && (
                                    <div className="card-count">
                                        {cardCount[actionCard.name]}x {/* Display the count */}
                                    </div>
                                )}
                                </div>
                                <strong>{actionCard.window}: </strong><br/>
                                {actionCard.text}<br/>
                            </div>
                            <br/>
                            <em className="flavor-text">{actionCard.flavorText}</em>
                            {/* Render the count in the upper-right corner if it's in the inclusion list */}

                        </div>
                        ))}
                    </div>
        </div>
    )
}

export default ActionCards;