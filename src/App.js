import React, { useEffect, useState , useRef , useLayoutEffect} from 'react';
import { HashRouter as Router, Route, Routes , useLocation} from 'react-router-dom'; // Use Routes instead of Switch
import './App.css';
import FactionList from './FactionList'; // Import the FactionList component
import FactionDetails from './FactionDetails'; // Import the FactionDetails component
import Sidebar from './Sidebar';
import DataPage from "./DataPage"; // Import the Sidebar component
import Agendas from "./AgendasPage";
import ActionCards from "./ActionCardPage";
import Explores from "./Explores";
import Relics from "./RelicsPage";
import Publics from "./PublicObjectivePage";
import Secrets from "./SecretObjectivesPage";


// Define the FactionDetails component to show detailed info
function App() {
    const dataDir = `${process.env.PUBLIC_URL}/TI4_map_generator_bot/src/main/resources/`

    const [factions, setFactions] = useState([]);
    const [dataSources, setDataSources] = useState({
        basePok: true,
        keleres: true,
        discordantStars: false,
    });

    // Function to handle changes to the checkboxes
    const handleDataSourceChange = (source) => {
        setDataSources(prevDataSources => ({
            ...prevDataSources,
            [source]: !prevDataSources[source],
        }));
    };

    // Helper function to render faction decals based on alias
    const renderFactionDecal = (alias) => {
        // Construct the decal image path based on the alias
        const decalPath = dataDir + `factions/${alias}.png`;

        // Style for the decal image
        const decalStyle = {
            height: '1.5em',  // Adjust size as needed
            marginRight: '10px',  // Add spacing between the decal and the text
            verticalAlign: 'middle'  // Ensure it aligns with the text
        };

        // Render the decal image
        return <img src={decalPath} alt={`${alias} decal`} style={decalStyle} />;
    };


    // Fetch faction data based on selected data sources
    useEffect(() => {
        async function fetchFactions() {
            let loadedFactions = [];

            if (dataSources.basePok) {
                const baseResponse = await fetch(dataDir + 'data/factions/base.json');
                const pokResponse = await fetch(dataDir + 'data/factions/pok.json');
                const baseFactions = await baseResponse.json();
                const pokFactions = await pokResponse.json();
                loadedFactions = [...loadedFactions, ...baseFactions, ...pokFactions];
            }

            if (dataSources.keleres) {
                const keleresResponse = await fetch(dataDir + 'data/factions/keleres.json');
                const keleresFactions = await keleresResponse.json();
                loadedFactions = [...loadedFactions, ...keleresFactions];
            }

            if (dataSources.discordantStars) {
                const dsResponse = await fetch(dataDir + 'data/factions/ds.json');
                const dsFactions = await dsResponse.json();
                loadedFactions = [...loadedFactions, ...dsFactions];
            }

            setFactions(loadedFactions);
        }

        fetchFactions();
    }, [dataSources]);

    return (
        <div className="app-container">
            <Sidebar
                dataSources={dataSources}
                handleDataSourceChange={handleDataSourceChange}
            />
            <div className="content">
                <Routes>
                    <Route
                        path="factions"
                        element={
                            <FactionList
                                factions={factions}
                                renderFactionDecal={renderFactionDecal}
                                dataSources={dataSources}
                                handleDataSourceChange={handleDataSourceChange}
                            />
                        }
                    />
                    <Route
                        path="factions/:source/:alias"
                        element={<FactionDetails dataDir={dataDir}/>}
                    />
                    <Route path="agendas" element={<Agendas
                        dataDir={dataDir}
                        dataSources={dataSources}
                        handleDataSourceChange={handleDataSourceChange}
                    />}/>
                    <Route path="action-cards" element={<ActionCards
                        dataDir={dataDir}
                        dataSources={dataSources}
                        handleDataSourceChange={handleDataSourceChange}
                    />}/>
                    <Route path="explores" element={<Explores
                        dataDir={dataDir}
                        dataSources={dataSources}
                        handleDataSourceChange={handleDataSourceChange}
                    />}/>
                    <Route path="relics" element={<Relics
                        dataDir={dataDir}
                        dataSources={dataSources}
                        handleDataSourceChange={handleDataSourceChange}
                    />}/>
                    <Route path="public-objectives" element={<Publics
                        dataDir={dataDir}
                        dataSources={dataSources}
                        handleDataSourceChange={handleDataSourceChange}
                    />}/>
                    <Route path="secret-objectives" element={<Secrets
                        dataDir={dataDir}
                        dataSources={dataSources}
                        handleDataSourceChange={handleDataSourceChange}
                    />}/>
                </Routes>
            </div>
        </div>
    );
}

export default App;