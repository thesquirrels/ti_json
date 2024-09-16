import React, {useEffect, useState} from 'react';
import './App.css'; // Import the global CSS file

function App() {
    const dataDir = '/TI4_map_generator_bot/src/main/resources/'

    const [factions, setFactions] = useState([]);  // Store all factions
    const [selectedFaction, setSelectedFaction] = useState(null);  // Track the currently selected faction
    const [leaderData, setLeaderData] = useState(null);  // Store leader data for the selected faction
    const [abilityData, setAbilityData] = useState(null);  // Store ability data
    const [homePlanetData, setHomePlanetData] = useState([]);  // Store home planet data
    const [unitData, setUnitData] = useState([]);  // Store all unit data
    const [extraComponents, setExtraComponents] = useState([]);
    const [customStartingTech, setCustomStartingTech] = useState([]);
    const [techData, setTechData] = useState([]);  // Store technology data
    const [promissoryNoteData, setPromissoryNoteData] = useState([]);

    // Track the selected data sources
    const [dataSources, setDataSources] = useState({
        basePok: true,
        keleres: true,
        discordantStars: false,
    });

    const lowerFirstLetter = (str) => {
        if (!str) return "";  // Return empty string if str is undefined or null
        return str.charAt(0).toLowerCase() + str.slice(1);
    };
    const ensurePeriod = (str) => {
        if (!str) return "";  // Return empty string if str is undefined or null
        return str.trim().endsWith(".") ? str : str + ".";
    };

    // Helper function to map tech type to corresponding color
    const getTechTypeColor = (types) => {
        const typeMap = {
            "PROPULSION": "B",
            "WARFARE": "R",
            "CYBERNETIC": "Y",
            "BIOTIC": "G"
        };

        // Return the color for the first type that matches, or "Unknown" if no match
        const firstType = types?.[0];  // Get the first tech type in the array
        return typeMap[firstType] || "Unknown";
    };

    // Helper function to map tech/unit types to images and render them
    const renderTechOrUnitImages = (typeString) => {
        // Map tech/unit types to corresponding image paths
        const techTypeToImage = {
            B: 'general/Propulsion_dark.png',
            R: 'general/Warfare_dark.png',
            Y: 'general/Cybernetic_dark.png',
            G: 'general/Biotic_dark.png',
            // Add other mappings as needed
        };

        // Function to get the image path for a given type
        const getTechTypeImage = (type) => techTypeToImage[type] || null;

        // Style for images
        const imageStyle = { height: '1em', verticalAlign: 'middle' };
        if (typeof typeString !== 'string') {
            return null; // Return null if not a valid string
        }
        // Split the typeString into individual characters and render each as an image
        return typeString.split('').map((char, index) => {
            const techTypeImage = getTechTypeImage(char);
            return techTypeImage ? (
                <img key={index} src={dataDir + techTypeImage} alt={char} style={imageStyle} />
            ) : (
                <span key={index}>{char}</span> // Fallback if no image is found for the type
            );
        });
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

    // Normalizes Keleres aliases to 'keleres'
    const normalizeFactionAlias = (alias) => {
        const keleresAliases = ['keleresm', 'keleresx', 'keleresa'];
        return keleresAliases.includes(alias) ? 'keleres' : alias;
    };

    // Abbreviation to full name mapping
    const unitMap = {
        cv: "carrier",
        cr: "cruiser",
        ff: "fighter",
        inf: "infantry",
        sd: "space dock",
        pds: "PDS",
        dn: "dreadnought",
        dd: "destroyer",
        fs: "flagship"
    };

    const formatUnitInfo = (unit, prerequisites = null) => {
        const fields = [];

        if (unit.afbHitsOn) {
            fields.push(
                <span key="afb">
                    <strong>ANTI-FIGHTER BARRAGE </strong> {unit.afbHitsOn}x{unit.afbDieCount}
                </span>
            );
        }
        if (unit.bombardHitsOn) {
            fields.push(
                <span key="bombard">
                    <strong>BOMBARDMENT </strong> {unit.bombardHitsOn}x{unit.bombardDieCount}
                </span>
            );
        }
        // Add sustain damage if true
        if (unit.sustainDamage) {
            fields.push(<span key="sustainDamage"><strong>SUSTAIN DAMAGE</strong></span>);
        }

        // Add production value if it exists
        if (unit.productionValue) {
            fields.push(<span key="production"><strong>PRODUCTION </strong> {unit.productionValue}</span>);
        }

        // Add planetary shield if true
        if (unit.planetaryShield) {
            fields.push(<span key="planetaryShield"><strong>PLANETARY SHIELD</strong></span>);
        }

        // Add cost if it exists
        if (unit.cost) {
            const displayCost = unit.cost === 0.5 ? "1x2" : unit.cost;
            fields.push(<span key="cost"><strong>Cost:</strong> {displayCost}</span>);
        }

        // Add combat info if combatHitsOn exists
        if (unit.combatHitsOn) {
            fields.push(
                <span key="combat">
                    <strong>Combat:</strong> {unit.combatHitsOn}x{unit.combatDieCount}
            </span>
            );
        }
        // Add move value if it exists
        if (unit.moveValue) {
            fields.push(<span key="move"><strong>Move:</strong> {unit.moveValue}</span>);
        }

        // Add capacity if it exists
        if (unit.capacityValue) {
            fields.push(<span key="capacity"><strong>Capacity:</strong> {unit.capacityValue}</span>);
        }

        const hasAbility = !!unit.ability;

        // Join fields with commas and return the formatted JSX
        return (
            <>
                <span><strong>{unit.name}</strong> {prerequisites ? (
                    <>
                        {renderTechOrUnitImages(prerequisites)}
                    </>
                ) : (
                    <>
                        ({unit.baseType})
                    </>
                )}
                </span><br/>

                {/* Display ability first, if it exists */}
                {hasAbility && (
                    <>
                        <span key="ability">{unit.ability}</span>
                        <br/>
                    </>
                )}

                {/* Render any remaining fields that are not part of the core stats */}
                {fields
                    .filter(
                        (field) =>
                            field.key !== 'cost' &&
                            field.key !== 'combat' &&
                            field.key !== 'move' &&
                            field.key !== 'capacity'
                    )
                    .map((field, index, array) => (
                        <React.Fragment key={index}>
                            {field}
                            {index < array.length - 1 && ", "}
                        </React.Fragment>
                    ))}
                <br/>
                {/* Display core stats (Cost, Combat, Move, Capacity) in the desired order */}
                {[
                    fields.find((field) => field.key === 'cost'),
                    fields.find((field) => field.key === 'combat'),
                    fields.find((field) => field.key === 'move'),
                    fields.find((field) => field.key === 'capacity')
                ]
                    .filter(Boolean) // Filter out any undefined fields if any are missing
                    .map((field, index, array) => (
                        <React.Fragment key={index}>
                            {field}
                            {index < array.length - 1 && ", "}
                        </React.Fragment>
                    ))
                }
            </>
        );
    };


    const parseStartingFleet = (fleetString) => {
        // Object to hold the sum of each unit type
        const fleetCount = {};

        // Split the fleet string into parts and parse each one
        const fleetParts = fleetString.split(",");
        fleetParts.forEach(part => {
            // Extract the count and unit abbreviation (e.g., "2 cv" or "cr")
            const match = part.match(/(\d*)\s*(\w+)/);
            if (match) {
                const count = match[1] ? parseInt(match[1], 10) : 1;  // If no count is specified, assume 1
                const unit = match[2];

                // Map the unit abbreviation to the full name
                if (unitMap[unit]) {
                    const unitName = unitMap[unit];

                    // Sum the units
                    if (fleetCount[unitName]) {
                        fleetCount[unitName] += count;
                    } else {
                        fleetCount[unitName] = count;
                    }
                }
            }
        });
        // Format the output string
        return Object.entries(fleetCount)
            .map(([unitName, count]) => {
                // Special case for "infantry" (no plural form)
                if (unitName === "infantry") {
                    return `${count} infantry`;
                }

                // Handle plural form for other units
                return `${count} ${unitName}${count > 1 ? "s" : ""}`;
            })
            .join(", ");
    };

    const formatTechText = (text) => {
        if (!text) return null;

        // Check if the text starts with "ACTION:" and bold it
        if (text.startsWith("ACTION:")) {
            return (
                <>
                    <strong>ACTION:</strong> {text.slice(7)} {/* Remove "ACTION:" and display the rest */}
                </>
            );
        }

        return <>{text}</>;
    };

    // Load faction data based on selected data sources
    useEffect(() => {
        const fetchFactions = async () => {
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
        };

        fetchFactions();
    }, [dataSources]);

    useEffect(() => {
        if (selectedFaction && selectedFaction.source) {
            async function fetchLeaderData() {
                try {
                    let leaderResponse;
                    // Conditional logic based on selectedFaction.source
                    if (selectedFaction.source === "base" || selectedFaction.source === "codex3") {
                        // Handle case where source is "base"
                        leaderResponse = await fetch(dataDir + 'data/leaders/pok.json');
                    } else {
                        // Default case: fetch based on the source value
                        leaderResponse = await fetch(dataDir + `data/leaders/${selectedFaction.source}.json`);
                    }

                    const leaderJson = await leaderResponse.json();
                    setLeaderData(leaderJson);  // Store leader data
                } catch (error) {
                    console.error("Error fetching leader data:", error);
                }
            }
            fetchLeaderData();
        }
    }, [selectedFaction]);

    // Load faction ability data based on the selected faction's source
    useEffect(() => {
        if (selectedFaction && selectedFaction.source) {
            async function fetchAbilityData() {
                try {
                    var abilitySource = selectedFaction.source === "codex3" ? "other" : selectedFaction.source;
                    const abilityResponse = await fetch(dataDir + `data/abilities/${abilitySource}.json`);
                    const abilityJson = await abilityResponse.json();
                    setAbilityData(abilityJson);  // Store ability data
                } catch (error) {
                    console.error("Error fetching ability data:", error);
                }
            }
            fetchAbilityData();
        }
    }, [selectedFaction]);

// Load home planet data based on the selected faction's homePlanets
    useEffect(() => {
        if (selectedFaction && selectedFaction.homePlanets) {
            async function fetchHomePlanetData() {
                try {
                    // Fetch all home planet JSON files in parallel
                    const planetPromises = selectedFaction.homePlanets.map(planet =>
                        fetch(dataDir + `planets/${planet}.json`).then(res => res.json())
                );
                    const planets = await Promise.all(planetPromises);
                    setHomePlanetData(planets);  // Store all fetched planet data
                } catch (error) {
                    console.error("Error fetching home planet data:", error);
                }
            }
            fetchHomePlanetData();
        }
    }, [selectedFaction]);


    useEffect(() => {
        if (selectedFaction && selectedFaction.source) {
            async function fetchTechData() {
                try {
                    let techData = [];

                    // Fetch "pok" data for both "pok" and "ds" sources
                    const pokResponse = await fetch(dataDir + 'data/technologies/pok.json');
                    const pokJson = await pokResponse.json();
                    techData = [...pokJson]; // Initialize techData with pok data

                    // Fetch "ds" data if the source is "ds"
                    if (selectedFaction.source === "ds") {
                        const dsResponse = await fetch(dataDir + 'data/technologies/ds.json');
                        const dsJson = await dsResponse.json();
                        techData = [...techData, ...dsJson]; // Combine pok and ds data
                    }
                    setTechData(techData); // Set the combined tech data
                } catch (error) {
                    console.error("Error fetching tech data:", error);
                }
            }
            fetchTechData();
        }
    }, [selectedFaction]);

    // Load unit data based on the selected faction's source
    useEffect(() => {
        if (selectedFaction && selectedFaction.source) {
            async function fetchUnitData() {
                var unitSource = selectedFaction.source === "base"
                    ? "pok"
                    : selectedFaction.source === "codex3"
                        ? "keleres"
                        : selectedFaction.source;

                const unitResponse = await fetch(dataDir + `data/units/${unitSource}.json`);
                try {
                    // Handle special case for base source
                    const unitJson = await unitResponse.json();
                    setUnitData(unitJson);
                } catch (error) {
                    console.error("Error fetching unit data:", error);
                }
            }
            fetchUnitData();
        }
    }, [selectedFaction]);


    // Load promissory note data based on the selected faction's source
    useEffect(() => {
        if (selectedFaction && selectedFaction.source) {
            async function fetchPromissoryNoteData() {
                try {
                    // Handle special case for base source
                    const promissorySource = selectedFaction.source === "base" || selectedFaction.source === "pok" || selectedFaction.source === "codex3" ? "promissory_notes/promissory_notes" : `promissory_notes/${selectedFaction.source}`;
                    const promissoryResponse = await fetch(dataDir + `data/${promissorySource}.json`);
                    const promissoryJson = await promissoryResponse.json();
                    setPromissoryNoteData(promissoryJson);
                } catch (error) {
                    console.error("Error fetching promissory note data:", error);
                }
            }

            fetchPromissoryNoteData();
        }
    }, [selectedFaction]);

    // Fetch starting_tech.json
    useEffect(() => {
        async function fetchCustomStartingTech() {
            try {
                const response = await fetch('/starting_tech.json'); // Adjust path accordingly
                const data = await response.json();
                setCustomStartingTech(data);
            } catch (error) {
                console.error('Error fetching custom starting tech data:', error);
            }
        }
        fetchCustomStartingTech();
    }, []);

    // Fetch the extra components JSON data
    useEffect(() => {
        async function fetchExtraComponents() {
            try {
                const response = await fetch('/misc_elements.json'); // Adjust path as necessary
                const data = await response.json();
                setExtraComponents(data);
            } catch (error) {
                console.error('Error fetching extra components:', error);
            }
        }
        fetchExtraComponents();
    }, []);

    // Function to handle clicking on a faction name
    const handleFactionClick = (faction) => {
        setSelectedFaction(faction);  // Set the selected faction
        setLeaderData(null);  // Reset leader data to avoid old data showing up for a moment
    };

    // Handle changes in checkbox selection
    const handleDataSourceChange = (source) => {
        setDataSources((prev) => ({
            ...prev,
            [source]: !prev[source],
        }));
    };

    if (selectedFaction && leaderData && abilityData && homePlanetData) {
        // Show detailed information for the selected faction
        return (
            <div className="App">
                <button onClick={() => setSelectedFaction(null)}>Back to Factions List</button>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', paddingLeft: '20px', paddingRight: '20px', align: 'top'}}>
                    {/* Left Column: Faction Name and Abilities */}
                    <div style={{flex: 1}}>
                        <h1 style={{paddingTop:'0px'}}>{renderFactionDecal(selectedFaction.alias)} {selectedFaction.factionName}</h1>
                        <ul>
                            {selectedFaction.abilities.map(abilityKey => {
                                // Find the matching ability in abilityData array by id
                                const ability = abilityData.find(abilityItem => abilityItem.id === abilityKey);

                                if (ability) {
                                    return (
                                        <li key={abilityKey}>
                                            <strong>{ability.name}</strong>
                                            <br/>
                                            {/* If ability.window is "ACTION", wrap in <strong>, otherwise no formatting */}
                                            {ability.window ? (
                                                ability.window === "ACTION" ? (
                                                    <strong>ACTION: </strong>
                                                ) : (
                                                    ability.window + ", "
                                                )
                                            ) : (
                                                ""
                                            )}
                                            {lowerFirstLetter(ability.windowEffect)} {ensurePeriod(ability.permanentEffect)}
                                        </li>
                                    );
                                } else {
                                    // Fallback if the ability data is not available
                                    return <li key={abilityKey}>{abilityKey}</li>;
                                }
                            })}
                        </ul>
                        <h3>Flagship and Mech</h3>
                        <ul>
                            {unitData
                                .filter(unit => normalizeFactionAlias(unit.faction?.toLowerCase()) === normalizeFactionAlias(selectedFaction.alias?.toLowerCase()) &&
                                    (unit.baseType === "flagship" || unit.baseType === "mech"))
                                .map(unit => (
                                    <li key={unit.id}>
                                        {formatUnitInfo(unit)}
                                    </li>
                                ))}
                        </ul>
                    </div>

                    {/* Right Column: Home System, Starting Fleet, Commodities, and Starting Tech */}
                    <div style={{flex: 2, paddingLeft: '20px', paddingTop: '50px'}}>
                        <div style={{display: 'flex', flexWrap: 'wrap', columnGap: '20px'}}>

                            {/* Home System */}
                            <div>
                                <strong>Home System: </strong>
                                {homePlanetData.map((planet, index) => (
                                    <span key={planet.id}>
                                            {planet.name}: {planet.resources}/{planet.influence}
                                        {/* Conditionally render optional fields if they exist */}
                                        {planet.techSpecialties && ` (Tech Specialties: ${planet.techSpecialties})`}
                                        {planet.planetType && planet.planetType !== 'FACTION' && ` (Planet Type: ${planet.planetType})`}
                                        {/* Add a comma and space after each planet except the last one */}
                                        {index < homePlanetData.length - 1 && ", "}
                                        </span>
                                ))}
                                {homePlanetData.map(planet => (
                                    planet.legendaryAbilityName && (
                                        <div key={`${planet.id}-legendary`}>
                                            <em>{planet.name} Legendary Ability:</em> {planet.legendaryAbilityText}
                                        </div>
                                    )
                                ))}
                            </div>
                            {/* Starting Fleet */}
                            <div>
                                <strong>Starting Fleet: </strong>
                                {parseStartingFleet(selectedFaction.startingFleet)}
                            </div>
                            {/* Commodities */}
                            <div>
                                <strong>Commodities: </strong>
                                {selectedFaction.commodities}
                            </div>
                            {/* Starting Technologies */}
                            <div>
                                <strong>Starting Technologies: </strong>
                                {(() => {
                                    // Find the custom starting tech for the selected faction
                                    const customTech = customStartingTech.find(tech => tech.alias === selectedFaction.alias);
                                    // If custom starting tech exists, display custom tech data
                                    if (customTech) {
                                        return (
                                            <>
                                                <span>{customTech.text} </span>
                                                {customTech.techList.map((techAlias, index) => {
                                                    const tech = techData.find(techItem => techItem.alias === techAlias);
                                                    const isLastTech = index === customTech.techList.length - 1;
                                                    return (
                                                        <span key={techAlias}>
                                                                {tech ? (
                                                                    <>
                                                                        {renderTechOrUnitImages(getTechTypeColor(tech.types))} {tech.name}
                                                                    </>
                                                                ) : (
                                                                    <span>{techAlias} (Unknown Tech)</span>
                                                                )}
                                                            {!isLastTech && ", "}
                                                            </span>
                                                    );
                                                })}
                                            </>
                                        );
                                    }

                                    // Fallback: display regular starting tech if no custom data is found
                                    return (
                                        <>
                                            {selectedFaction.startingTech.map((techAlias, index) => {
                                                const tech = techData.find(techItem => techItem.alias === techAlias);
                                                const isLastTech = index === selectedFaction.startingTech.length - 1;

                                                return (
                                                    <span key={techAlias}>
                                                        {tech ? (
                                                            <>
                                                                {renderTechOrUnitImages(getTechTypeColor(tech.types))} {tech.name}
                                                            </>
                                                        ) : (
                                                            <span>{techAlias} (Unknown Tech)</span>
                                                        )}
                                                        {!isLastTech && ", "}
                                                    </span>
                                                );
                                            })}
                                        </>
                                    );
                                })()}


                                <h3>Faction Technologies</h3>
                                <ul>
                                    {unitData
                                        .filter(unit => unit.id?.endsWith("2") && normalizeFactionAlias(unit.faction?.toLowerCase()) === normalizeFactionAlias(selectedFaction.alias?.toLowerCase()))
                                        .map(upgradedUnit => {
                                            // Find the base unit for the upgrade (remove "2" from baseType to find the original unit)
                                            const baseUnit = unitData.find(unit => unit.baseType === upgradedUnit.baseType.replace("2", "") && unit.faction?.toLowerCase() === selectedFaction.alias?.toLowerCase());
                                            const prerequisiteTech = techData.find(tech => tech.alias === upgradedUnit.requiredTechId);
                                            return (
                                                <>
                                                    <li key={`base-${baseUnit?.id}`}>
                                                        {formatUnitInfo(baseUnit)}
                                                    </li>
                                                    <li key={`upgrade-${upgradedUnit.id}`}>
                                                        {formatUnitInfo(upgradedUnit, prerequisiteTech?.requirements)}
                                                    </li>
                                                </>
                                            );

                                        })}
                                </ul>
                                <ul>
                                    {techData
                                        .filter(tech => normalizeFactionAlias(tech.faction?.toLowerCase()) === normalizeFactionAlias(selectedFaction.alias?.toLowerCase()) && !tech.types?.includes("UNITUPGRADE"))
                                        .map(tech => (
                                            <li key={tech.alias}>
                                                <strong>{tech.name}</strong> ({renderTechOrUnitImages(tech.requirements)})
                                                <br/>
                                                {formatTechText(tech.text)}
                                            </li>
                                        ))}
                                </ul>
                                <h3>Promissory Notes</h3>
                                <ul>
                                    {selectedFaction.promissoryNotes.map(noteAlias => {
                                        // Find the matching promissory note from promissoryNoteData by alias
                                        const note = promissoryNoteData.find(noteItem => noteItem.alias === noteAlias);

                                        return (
                                            <li key={noteAlias}>
                                                {note ? (
                                                    <>
                                                        <strong>{note.name}</strong>
                                                        <br/>
                                                        <>{note.text}</>
                                                    </>
                                                ) : (
                                                    <span>{noteAlias} (Unknown Note)</span> // Fallback if the note is not found
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div style={{flex: 3, paddingLeft: '20px', paddingTop: '30px'}}>
                        <h3>Leaders</h3>
                        <ul>
                            {selectedFaction.leaders.map(leaderKey => {
                                // Find the matching leader in leaderData array by id
                                const leader = leaderData.find(leaderItem => leaderItem.id === leaderKey);

                                if (leader) {
                                    return (
                                        <li key={leaderKey}>
                                            <strong>{leader.name}</strong> ({leader.type}) - {leader.title}
                                            <br/>
                                            <strong>{leader.abilityWindow}</strong> {leader.abilityText}
                                            <br/>
                                            {/* Display Unlock Condition only if the leader is a Commander */}
                                            {leader.type === "commander" && (
                                                <>
                                                    <em>Unlock Condition:</em> {leader.unlockCondition}
                                                    <br/>
                                                </>
                                            )}
                                        </li>
                                    );
                                } else {
                                    // Fallback if the leader data is not available
                                    return <li key={leaderKey}>{leaderKey}</li>;
                                }
                            })}
                        </ul>
                        {/* Display extra components if they exist after the leaders */}
                        {(() => {
                            const factionExtraComponents = extraComponents.find(comp => comp.alias === selectedFaction.alias);

                            // Ensure the correct return behavior and no syntax issues
                            if (factionExtraComponents) {
                                return (
                                    <div>
                                        <h3>{factionExtraComponents.title}</h3>
                                        <ul>
                                            {factionExtraComponents.components.map((component, index) => (
                                                <li key={index}>
                                                    <strong>{component.title}</strong>
                                                    <p>{component.text}</p>
                                                    {component.cost && <p>Cost: {component.cost}</p>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            }
                            return null; // Return null if there are no extra components
                        })()}
                    </div>
                </div>
            </div>
        );
    }

    // Show a list of factions if no faction is selected
    const baseFactions = factions.filter(faction => faction.source === 'base');
    const pokFactions = factions.filter(faction => faction.source === 'pok');
    const keleresFactions = factions.filter(faction => faction.source === 'codex3');
    const discordantStarsFactions = factions.filter(faction => faction.source === 'ds');

    return (
        <div className="App">
            <div style={{
                columnWidth: '250px',
                columnGap: '20px',
                maxHeight: '90vh', // Limits the height to 80% of the viewport height
                overflowY: 'auto', // Allows scrolling if the content exceeds the max height
                columnFill: 'balance', // Balances the columns to avoid leaving empty spaces
                padding: '20px'
            }}>
                {/* Base Factions */}
                {baseFactions.length > 0 && (
                    <div style={{breakInside: 'avoid'}}>
                        <h3 style={{ margin: 0, padding: '10px 0' }}>Base Factions</h3>
                        <ul style={{paddingLeft: '20px'}}>
                            {baseFactions.map(faction => (
                                <li key={faction.alias} onClick={() => handleFactionClick(faction)}
                                    style={{cursor: 'pointer', listStyle: 'none'}}>
                                    {renderFactionDecal(faction.alias)} {faction.factionName}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* PoK Factions */}
                {pokFactions.length > 0 && (
                    <div style={{breakInside: 'avoid'}}>
                        <h3 style={{ margin: 0, padding: '10px 0' }}>PoK Factions</h3>
                        <ul style={{paddingLeft: '20px'}}>
                            {pokFactions.map(faction => (
                                <li key={faction.alias} onClick={() => handleFactionClick(faction)}
                                    style={{cursor: 'pointer', listStyle: 'none'}}>
                                    {renderFactionDecal(faction.alias)} {faction.factionName}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Keleres Factions */}
                {keleresFactions.length > 0 && (
                    <div style={{breakInside: 'avoid'}}>
                        <h3 style={{ margin: 0, padding: '10px 0' }}>Keleres Factions</h3>
                        <ul style={{paddingLeft: '20px'}}>
                            {keleresFactions.map(faction => (
                                <li key={faction.alias} onClick={() => handleFactionClick(faction)}
                                    style={{cursor: 'pointer', listStyle: 'none'}}>
                                    {renderFactionDecal(faction.alias)} {faction.factionName}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Discordant Stars Factions */}
                {discordantStarsFactions.length > 0 && (
                    <div style={{breakInside: 'avoid'}}>
                        <h3 style={{ margin: 0, padding: '10px 0' }}>Discordant Stars Factions</h3>
                        <ul style={{paddingLeft: '20px'}}>
                            {discordantStarsFactions.map(faction => (
                                <li key={faction.alias} onClick={() => handleFactionClick(faction)}
                                    style={{cursor: 'pointer', listStyle: 'none'}}>
                                    {renderFactionDecal(faction.alias)} {faction.factionName}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div style={{display: 'flex', gap: '20px', alignItems: 'center', paddingTop: '20px'}}>
                <label>
                    <input
                        type="checkbox"
                        checked={dataSources.basePok}
                        onChange={() => handleDataSourceChange('basePok')}
                    />
                    Base + PoK
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={dataSources.keleres}
                        onChange={() => handleDataSourceChange('keleres')}
                    />
                    Keleres
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={dataSources.discordantStars}
                        onChange={() => handleDataSourceChange('discordantStars')}
                    />
                    Discordant Stars
                </label>
            </div>
        </div>
    );
}

export default App;