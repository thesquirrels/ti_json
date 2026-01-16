import React, {useEffect, useState} from "react";

function Technology({ dataDir, dataSources, handleDataSourceChange}) {

    const [techData, setTechData] = useState([]);

    useEffect(() => {
        async function fetchTechData() {
            try {
                var files = [dataDir + 'TI4_map_generator_bot/src/main/resources/data/technologies/pok.json'];
                files.push(dataDir + 'TI4_map_generator_bot/src/main/resources/data/technologies/te_techs.json');
                files.push(dataDir + 'TI4_map_generator_bot/src/main/resources/data/units/baseUnits.json');
                if (dataSources.discordantStars === 'ds') {
                    files.push(dataDir + 'TI4_map_generator_bot/src/main/resources/data/technologies/ds.json');
                }
                var uniqueFiles = Array.from(new Set(files));
                var jsons = await Promise.all(uniqueFiles.map(function (url) {
                    return fetch(url).then(function (r) { return r.json(); });
                }));
                var techData = [].concat.apply([], jsons); // flat()
                setTechData(techData); // Set the combined tech data
            } catch (error) {
                console.error("Error fetching tech data:", error);
            }
        }
        fetchTechData();
    }, [dataSources]);

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

    const LETTER_TO_COLOR = { B:'#2997ff', R:'#d23b2d', Y:'#f3c800', G:'#2ea44f' };

    function buildUnitMap() {
        // canonical name -> list of aliases/typos (include canonical itself)
        var aliasesByCanon = {
            // Core units
            'carrier':      ['carrier','cv','carriers','car','carol','carols','carr'],
            'cruiser':      ['cruiser','ca','cr','cruisers','cru','cruser','criuser','tommer','cruiswr','crusier','cl'],
            'destroyer':    ['destroyer','dd','destroyers','destoryer','destoryers','stroter','stroters','dest','des','stroder','stroders','strudel','strudels','dangle','bopper','danglebopper'],
            'dreadnought':  ['dreadnought','dn','dread','dr','dreadnough','dreadnaugh','dreads','dreadnaught','dreadnaughts','dred','dreds','chad','chads'],
            'fighter':      ['fighter','ff','fighters','figter','fight','ftr','hp','hps','figther','ffs'],
            'flagship':     ['flagship','fs','flag','flaggy','hugevan','flagy'],
            'infantry':     ['infantry','inf','gf','groud','groundforce','dude','duder','dudes','duders','dudettes','dudette','infantery'],
            'mech':         ['mech','mf','mechanized','mechs'],
            'pds':          ['pds','pd','pdf'],
            'space dock':   ['space dock','sd','spacedock','space_dock','dock','spd'],
            'war sun':      ['war sun','ws','war','warsuns','war_sun','peacesun','peace','warsun'],

            'cabal space dock': ['csd','vsd','vrcsd','dtsd','cabalspacedock','vuildock','cabaldock','cabalsd'],
            "tyrant's lament":  ['tyrantslament','tyrant','absolfs','tyr','lament'],
            'the lady':         ['lady','thelady','gheminalady'],
            'plenary orbital':  ['plenaryorbital','plenary','orbital','plen','orb'],
            'cavalry (nomad pn)': ['cavalry','calvary','calvery','cav','nomadpn'],
        };

        var map = {};
        Object.keys(aliasesByCanon).forEach(function(canon) {
            aliasesByCanon[canon].forEach(function(alias) {
                map[normToken(alias)] = canon;   // every alias → canonical
            });
            map[normToken(canon)] = canon;     // canonical → canonical
        });
        return map;
    }

    function normToken(s) {
        return String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    const unitMap = buildUnitMap();

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
        if (unit.spaceCannonHitsOn) {
            fields.push(
                <span key="space_cannon">
                    <strong>SPACE CANNON </strong> {unit.spaceCannonHitsOn}x{unit.spaceCannonDieCount}
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
        const hasSubtitle = !!unit.subtitle;

        // Join fields with commas and return the formatted JSX
        return (
            <>
                {hasSubtitle && (
                    <>
                        <span key="subtitle"><i>{unit.subtitle}</i></span>
                        <br/><br/>
                    </>
                )}
                {/* Display ability first, if it exists */}
                {hasAbility && (
                    <>
                        <span key="ability">{unit.ability}</span>
                        <br/>
                    </>
                )}
                <br></br>
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
                <br></br>
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

    // Helper function to map tech/unit types to images and render them
    const renderTechOrUnitImages = (typeString) => {
        // Map tech/unit types to corresponding image paths
        const techTypeToImage = {
            B: 'TI4_map_generator_bot/src/main/resources/general/Propulsion_dark.png',
            R: 'TI4_map_generator_bot/src/main/resources/general/Warfare_dark.png',
            Y: 'TI4_map_generator_bot/src/main/resources/general/Cybernetic_dark.png',
            G: 'TI4_map_generator_bot/src/main/resources/general/Biotic_dark.png',
        };

        // Function to get the image path for a given type
        const getTechTypeImage = (type) => techTypeToImage[type] || null;

        // Style for images
        const imageStyle = { height: '25px', verticalAlign: 'left' };
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

    const filteredDataTech = techData.filter(tech => {
        const isFromSelectedSource = (
            (dataSources.basePok && (tech.source === 'base' ||
                tech.source === 'codex1' || tech.source === 'pok')) ||
            (dataSources.keleres && tech.source === 'codex2') ||
            (dataSources.keleres && tech.source === 'codex3') ||
            (dataSources.keleres && tech.source === 'codex4') ||
            (dataSources.discordantStars && (tech.source === 'ds' || tech.source === 'uncharted_space')) ||
            (dataSources.thunders_edge && tech.source === 'thunders_edge')
        );

        const isFaction = (typeof tech.faction === 'string')
        const isUnit = (typeof tech.requiredTechId === 'string' || typeof tech.upgradesToUnitId === 'string')

        const isExcluded = (tech.id === 'nowarsun' || tech.id === 'mech' || tech.id === 'mech' || tech.id === 'flagship' || tech.id === 'lady')

        if (!isFromSelectedSource || isFaction || isUnit || isExcluded) return false; // Filter out cards not from the selected sources

        return true;
    });

    return (
        <div className="planet-grid-container">
            {filteredDataTech.map((tech) => {
                return (
                    <div key={tech.id} className="planet-grid-item"
                         style={{ border: `2px solid ${LETTER_TO_COLOR[getTechTypeColor(tech.types)]}` }}>
                        <div className="card-text">
                            <div className="card-title">
                                <span style={{fontWeight: 'bold', fontSize: '14pt'}}>{tech.name}</span>
                                <div className="card-corner-row-tech">
                                    {renderTechOrUnitImages(tech.requirements)}
                                </div>
                            </div>
                            <div className="tech-body">
                                <br/>
                                {Array.isArray(tech.types) && tech.types.includes('UNITUPGRADE') ? (
                                    // UNIT UPGRADE: show with formatUnitInfo, using the prerequisite's requirements as the badge strip
                                    (() => {
                                        return formatUnitInfo(techData.find(t => (t.requiredTechId) === tech.alias));
                                    })()
                                ) : (
                                    // Normal tech: show formatted text
                                    <>{formatTechText(tech.text)}</>
                                )}
                            </div>
                        </div>
                        <em className="flavor-text">{tech.flavourText}</em>
                    </div>
                );
            })}
        </div>
    );
}

export default Technology;