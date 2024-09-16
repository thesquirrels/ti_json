import React, {useEffect, useState} from "react";

function Relics({ dataDir, dataSources, handleDataSourceChange}) {
    const relicSources = [
        'data/relics/codexii.json',
        'data/relics/pok.json',
        'data/relics/ds.json',
    ];
    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            let loadedData = [];

            // Loop through all the data sources and fetch them
            for (let source of relicSources) {
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
    }, [dataSources]);

    const formatRelicText = (text) => {
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

    const filteredDataRelics = data.filter(relicCard => {
        // Check if the card's source matches any of the selected expansions
        const isFromSelectedSource = (
            (dataSources.basePok && (relicCard.source === 'base' ||
                relicCard.source === 'codex1' || relicCard.source === 'pok')) ||
            (dataSources.keleres && relicCard.source === 'codex2') ||
            (dataSources.keleres && relicCard.source === 'codex3') ||
            (dataSources.discordantStars && relicCard.source === 'ds')
        );
        // If the card is not from the selected sources, ignore it
        if (!isFromSelectedSource) return false; // Filter out cards not from the selected sources

        return true;
    });

    return (
        <div>
            <div className="grid-container">
                {filteredDataRelics.map((relicCard) => (
                    <div key={relicCard.flavorText} className="grid-item">
                        <div className="card-text">
                            <span style={{fontWeight: 'bold', fontSize: '14pt'}}>{relicCard.name}</span><br/><br/>
                            {formatRelicText(relicCard.text)}<br/>
                        </div>
                        <br/>
                        <em className="flavor-text">{relicCard.flavourText}</em>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Relics;