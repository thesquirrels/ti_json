import React, {useEffect, useState} from "react";

function Publics({ dataDir, dataSources, handleDataSourceChange}) {

    const objectiveSources = [
        'TI4_map_generator_bot/src/main/resources/data/public_objectives/public_objectives.json',
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

    const filteredDataObjectives = data.filter(POCard => {
        // Check if the card's source matches any of the selected expansions
        const isFromSelectedSource = (
            (dataSources.basePok && (POCard.source === 'base' ||
                POCard.source === 'codex1' || POCard.source === 'pok')) ||
            (dataSources.keleres && POCard.source === 'codex2') ||
            (dataSources.keleres && POCard.source === 'codex3') ||
            (dataSources.keleres && POCard.source === 'codex4') ||
            (dataSources.discordantStars && (POCard.source === 'ds' || POCard.source === 'uncharted_space')) ||
            (dataSources.thunders_edge && POCard.source === 'thunders_edge')
        );
        // If the card is not from the selected sources, ignore it
        if (!isFromSelectedSource) return false; // Filter out cards not from the selected sources
        return true;
    });

    return (
            <div className="grid-container">
                {filteredDataObjectives.map((objectiveCard) => {
                    const typeImageSrc = objectiveCard.points === 1
                        ? `${dataDir}TI4_map_generator_bot/src/main/resources/general/Public1.png`
                        : objectiveCard.points === 2
                            ? `${dataDir}TI4_map_generator_bot/src/main/resources/general/Public2.png`
                            : null; // No image if points is neither 1 nor 2
                    return (
                    <div key={objectiveCard.alias} className="grid-item">
                        <div className="card-text">
                            <div className="card-title">
                                <span style={{fontWeight: 'bold', fontSize: '14pt'}}>{objectiveCard.name}</span><br/>
                                <div className='card-corner'>
                                    <img
                                        src={typeImageSrc}
                                        alt={`(${objectiveCard.points})`}
                                        className="card-type-image"
                                    />
                                </div>
                            </div>
                                ({objectiveCard.phase})<br/><br/>
                                {objectiveCard.text}<br/>
                            </div>
                            <br/>
                        <em className="flavor-text">{objectiveCard.flavorText}</em>
                    </div>
                    );
                })}
            </div>
        );
}
export default Publics;