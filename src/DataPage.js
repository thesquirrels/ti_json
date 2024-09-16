import { useEffect, useState } from 'react';

function DataPage({ title, dataSources, renderData }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            let loadedData = [];
            console.log('Fetching for', title, dataSources); // Log the title and sources

            // Loop through all the data sources and fetch them
            for (let source of dataSources) {
                try {
                    const response = await fetch(source);
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

    console.log(data); // Log the title and sources

    return (
        <div>
            <h1>{title}</h1>
            <div>
                {/* Call the renderData function to display the loaded data */}
                {renderData(data)}
            </div>
        </div>
    );
}

export default DataPage;
