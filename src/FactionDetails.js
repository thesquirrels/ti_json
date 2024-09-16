import {useParams, Link, useLocation} from "react-router-dom";
import React, {useEffect, useLayoutEffect, useState} from "react";
import './App.css';

function FactionDetails({ match , dataDir}) {

    const { source, alias } = useParams(); // Get both source and alias from the URL
    const [selectedFaction, setSelectedFaction] = useState(null);

    const [leaderData, setLeaderData] = useState(null);  // Store leader data for the selected faction
    const [abilityData, setAbilityData] = useState(null);  // Store ability data
    const [homePlanetData, setHomePlanetData] = useState([]);  // Store home planet data
    const [unitData, setUnitData] = useState([]);  // Store all unit data
    const [extraComponents, setExtraComponents] = useState([]);
    const [customStartingTech, setCustomStartingTech] = useState([]);
    const [techData, setTechData] = useState([]);  // Store technology data
    const [promissoryNoteData, setPromissoryNoteData] = useState([]);
    const [isMobileView, setIsMobileView] = useState(false); // State to track mobile view
    // Function to detect mobile view
    const handleResize = () => {
        setIsMobileView(window.innerWidth <= 768); // Adjust the width as per your layout needs
    };

    useEffect(() => {
        // Add event listener to window resize to track changes
        window.addEventListener('resize', handleResize);
        handleResize(); // Call it initially to set the correct view

        // Clean up the event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        async function fetchFactionDetails() {
            const factionFile = source === 'codex3' ? 'keleres.json' : `${source}.json`;
            try {
                const response = await fetch(dataDir + `data/factions/${factionFile}`);
                console.log(response)
                const data = await response.json();
                const foundFaction = data.find(faction => faction.alias === alias);
                console.log(alias)
                setSelectedFaction(foundFaction);
            } catch (error) {
                console.error('Error fetching faction data:', error);
            }
        }
        fetchFactionDetails();
    }, [alias]);

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
                </span>
                <br/>

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
                {fields
                    .filter(
                        (field) =>
                            field.key !== 'cost' &&
                            field.key !== 'combat' &&
                            field.key !== 'move' &&
                            field.key !== 'capacity'
                    )
                    .length > 0 && <br/>}
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
                const response = await fetch('../../starting_tech.json'); // Adjust path accordingly
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
                const response = await fetch('../../misc_elements.json'); // Adjust path as necessary
                const data = await response.json();
                setExtraComponents(data);
            } catch (error) {
                console.error('Error fetching extra components:', error);
            }
        }
        fetchExtraComponents();
    }, []);

    useEffect(() => {
        if (selectedFaction) {
            // Set the document title to the faction's name
            document.title = `${selectedFaction.factionName}`;
        } else {
            // Set a default title while loading or if no faction is selected
            document.title = "Loading Faction Details...";
        }
    }, [selectedFaction]); // This effect runs every time `selectedFaction` changes


    // Automatically scroll the user down on page load
    const isMobile = window.innerWidth <= 768; // Check if it's mobile
    useEffect(() => {
        if (isMobile) {
            // Wait for faction content to be rendered and scroll smoothly
            window.scrollTo({
                top: 260, // Scroll to 200px down
                behavior: 'smooth' // Enable smooth scrolling
            });
        }

    }, [promissoryNoteData]);
    useEffect(() => {
        if (isMobile) {
            window.scrollTo({
                top: 0, // Scroll to 200px down
            });
        }
    }, []); // Dependency array now includes 'location', so this effect runs on route changes


    // Add a loading state until faction data is fetched
    if (!(selectedFaction && leaderData && abilityData && homePlanetData)) return <p>Loading...</p>;

    return (
        <div className="faction-details">
            <div className="column column-1">
                {/*<Link to="/" className="back-button">Back to Faction List</Link>*/}
                {/* Left Column: Faction Name and Abilities */}
                <div className="faction-name">
                    <h1 style={{paddingTop: '0px'}}>{renderFactionDecal(selectedFaction.alias)} {selectedFaction.factionName}</h1>
                </div>
                <div className="abilities">
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
                </div>
                {/* Right Column: Home System, Starting Fleet, Commodities, and Starting Tech */}
                <div className="hs">
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
                </div>
            </div>
            <div className="column column-2">
                <div className="units">
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
                <div className="techs">
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
                </div>
            </div>
            <div className="column column-3">
                <div className="leaders">
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
                </div>
                <div className="pns">
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
                {/* Display extra components if they exist after the leaders */}
                {(() => {
                    const factionExtraComponents = extraComponents.find(comp => comp.alias === selectedFaction.alias);

                    // Ensure the correct return behavior and no syntax issues
                    if (factionExtraComponents) {
                        return (
                            <div className="extra">
                                <h3>{factionExtraComponents.title}</h3>
                                <ul>
                                    {factionExtraComponents.components.map((component, index) => (
                                        <li key={index}>
                                            <strong>{component.title}</strong>
                                            <br/>
                                            {component.text}
                                            <br/>
                                            {component.cost && <><strong>Cost: </strong> {component.cost}</>}
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
            );
            }

            export default FactionDetails;
