import React, {useEffect, useState} from "react";

function SCs({ dataDir, dataSources, handleDataSourceChange}) {

    const objectiveSources = [
        'TI4_map_generator_bot/src/main/resources/data/strategy_cards/pok.json',
        'TI4_map_generator_bot/src/main/resources/data/strategy_cards/te.json',
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

    const filteredDataSCs = React.useMemo(() => {
        // 1) filter by toggles
        const fromSelected = data.filter(SCCard => {
            const s = SCCard.source;
            return (
                (dataSources.basePok && (s === 'base' || s === 'codex1' || s === 'pok')) ||
                (dataSources.keleres && (s === 'codex2' || s === 'codex3' || s === 'codex4')) ||
                (dataSources.discordantStars && (s === 'ds' || s === 'uncharted_space')) ||
                (dataSources.thunders_edge && s === 'thunders_edge')
            );
        });

        // 2) pick ONE per initiative, with source priority
        // If thunders_edge is selected, it gets top priority for duplicates.
        const priority = dataSources.thunders_edge
            ? ['thunders_edge', 'codex4', 'codex3', 'codex2', 'ds', 'uncharted_space', 'pok', 'codex1', 'base']
            : ['codex4', 'codex3', 'codex2', 'ds', 'uncharted_space', 'pok', 'codex1', 'base'];

        const prioIndex = (src) => {
            const i = priority.indexOf(src);
            return i === -1 ? Infinity : i;
        };

        const byInitiative = new Map(); // initiative -> best card
        for (const card of fromSelected) {
            const key = String(card.initiative); // normalize
            const curr = byInitiative.get(key);
            if (!curr || prioIndex(card.source) < prioIndex(curr.source)) {
                byInitiative.set(key, card);
            }
        }

        // Optional: sort by numeric initiative for display
        return Array.from(byInitiative.values()).sort((a, b) => (a.initiative ?? 0) - (b.initiative ?? 0));
    }, [data, dataSources]);

    return (
        <div className="grid-container">
            {filteredDataSCs.map((SCCard) => {
                return (
                    <div key={SCCard.name}
                         className="grid-item"
                         style={{
                             border: `2px solid ${SCCard.colourHexCode || '#ccc'}`,
                         }}>
                        <div className="card-text">
                            <div className="card-title">
                                <span style={{fontWeight: 'bold', fontSize: '14pt'}}>{SCCard.name}</span><br/>
                                <div className='card-corner'>
                                    <span style={{fontWeight: 'bold', fontSize: '24pt'}}>{SCCard.initiative}</span>
                                </div>
                            </div>
                            <br></br><span style={{fontWeight: 'bold', fontSize: '12pt'}}>Primary</span>
                            {Array.isArray(SCCard.primaryTexts) && SCCard.primaryTexts.length > 0 && (
                                <ul className="sc-list">
                                    {SCCard.primaryTexts.map((t, i) => (
                                        <li key={`p-${i}`}>{t}</li>
                                    ))}
                                </ul>
                            )}
                            <br></br><span style={{fontWeight: 'bold', fontSize: '12pt'}}>Secondary</span>
                            {Array.isArray(SCCard.secondaryTexts) && SCCard.secondaryTexts.length > 0 && (
                                <ul className="sc-list">
                                    {SCCard.secondaryTexts.map((t, i) => (
                                        <li key={`s-${i}`}>{t}</li>
                                    ))}
                                </ul>
                            )}

                        </div>
                        <br/>
                        <em className="flavor-text">{SCCard.flavorText}</em>
                    </div>
                );
            })}
        </div>
    );
}
export default SCs;