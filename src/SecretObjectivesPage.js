import React, {useEffect, useState} from "react";

function Secrets({ dataDir, dataSources, handleDataSourceChange}) {

    const objectiveSources = [
        //'data/public_objectives/public_objectives.json',
        'data/secret_objectives/secret_objectives.json',
    ];
    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            let loadedData = [];

            // Loop through all the data sources and fetch them
            for (let source of objectiveSources) {
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

    const filteredDataSecrets = data.filter(secretObjective => {
        // Check if the card's source matches any of the selected expansions
        const isFromSelectedSource = (
            (dataSources.basePok && (secretObjective.source === 'base' ||
                secretObjective.source === 'codex1' || secretObjective.source === 'pok')) ||
            (dataSources.keleres && secretObjective.source === 'codex2') ||
            (dataSources.keleres && secretObjective.source === 'codex3') ||
            (dataSources.discordantStars && secretObjective.source === 'ds')
        );
        // If the card is not from the selected sources, ignore it
        if (!isFromSelectedSource) return false; // Filter out cards not from the selected sources

        return true;
    });

    return (
        <div className="grid-container">
            {filteredDataSecrets.map((objectiveCard) => (
                    <div key={objectiveCard.alias} className="grid-item">
                        <div className="card-text">
                            <span style={{fontWeight: 'bold', fontSize: '14pt'}}>{objectiveCard.name}</span><br/>
                            ({objectiveCard.phase})<br/><br/>
                            {objectiveCard.text}<br/>
                        </div>
                        <br/>
                    </div>
                ))}
        </div>
    );
}
export default Secrets;