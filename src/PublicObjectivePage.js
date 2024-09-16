import React, {useEffect, useState} from "react";

function Publics({ dataDir, dataSources, handleDataSourceChange}) {

    const objectiveSources = [
        'data/public_objectives/public_objectives.json',
        //'data/secret_objectives/secret_objectives.json',
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

    return (
            <div className="grid-container">
                {data.map((objectiveCard) => {
                    const typeImageSrc = objectiveCard.points === 1
                        ? `${dataDir}general/Public1.png`
                        : objectiveCard.points === 2
                            ? `${dataDir}general/Public2.png`
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