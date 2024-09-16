import React, {useEffect, useState} from "react";

function Agendas({ dataDir, dataSources, handleDataSourceChange}) {

    const agendaSources = [
        'data/agendas/base.json',
        'data/agendas/pok.json',
    ];
    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            let loadedData = [];

            // Loop through all the data sources and fetch them
            for (let source of agendaSources) {
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
        <div>
            <div className="grid-container">
                {data.map((agendaCard) => (
                    <div key={agendaCard.flavorText} className="grid-item">
                        <div className="card-text">
                            <span style={{fontWeight: 'bold', fontSize: '14pt'}}>{agendaCard.name}</span><br/>
                            ({agendaCard.type})<br/><br/>
                            <strong>{agendaCard.target}{agendaCard.text1 !== '' && (<>:</>)} </strong><br/>
                            {agendaCard.text1}<br/>
                            {agendaCard.text2}<br/>
                        </div>
                        <br/>
                        <em className="flavor-text">{agendaCard.flavorText}</em>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Agendas;