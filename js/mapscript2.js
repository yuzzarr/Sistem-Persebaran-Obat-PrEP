document.addEventListener('DOMContentLoaded', () => {
    const markersLayer = L.layerGroup();
    
    // Inisialisasi peta Leaflet
    const map = L.map('map').setView([-7.00, 110.43], 8);

    // Tambahkan layer peta dasar OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Tambahkan layer markersLayer ke dalam peta
    markersLayer.addTo(map);

    // URL raw dari file CSV di GitHub
    const csvUrl = 'https://raw.githubusercontent.com/yuzzarr/Sistem-Persebaran-Obat-PrEP/main/data.csv';

    // Fungsi untuk membaca CSV dan mengonversinya ke GeoJSON
    function readCSVAndConvertToGeoJSON(url, callback) {
        Papa.parse(url, {
            download: true,
            header: true,
            complete: function(results) {
                const data = results.data;
                const geojson = data.map(row => {

                    if (isNaN(parseFloat(row.FuzzyTopsis)) || isNaN(parseFloat(row.FuzzyWP))) {
                        return null; // Skip this row
                    }

                    return {
                        type: "Feature",
                        properties: {
                            name: row.Kota,
                            percentage: {
                                fuzzyTopsis: parseFloat(row.FuzzyTopsis),
                                fuzzyWP: parseFloat(row.FuzzyWP)
                            }
                        },
                        geometry: {
                            type: "Point",
                            coordinates: [parseFloat(row.Longitude), parseFloat(row.Latitude)]
                        }
                    };
                }).filter(feature => feature !== null); // Filter out invalid features
                callback(geojson);
            }
        });
    }

    // Membaca data CSV dan memprosesnya
    readCSVAndConvertToGeoJSON(csvUrl, (geojson) => {
        window.geojson = geojson;
        console.log(geojson)
    });

    window.hitungDistribusi = function() {
        const totalObat = parseInt(document.getElementById('totalObat').value, 10);
        let totalPersentase = 0;
        let totalObatCount = 0;

        if (isNaN(totalObat) || totalObat <= 0) {
            alert('Masukkan jumlah obat yang valid!');
            return;
        }

        const selectedMethodElement = document.getElementById('methodSelect');
        const selectedMethod = selectedMethodElement.value;

        // Clear existing layers
        markersLayer.clearLayers();

        const tableBody = document.getElementById('distributionTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';

        if (!window.geojson || window.geojson.length === 0) {
            alert('Data GeoJSON tidak valid atau kosong.');
            return;
        }

        let distribusiObat = [];

        window.geojson.forEach(point => {
            let jumlahObat;

            if (selectedMethod == 'fuzzyTopsis') {
                jumlahObat = Math.floor((totalObat * point.properties.percentage.fuzzyTopsis) / 100);
                totalPersentase += point.properties.percentage.fuzzyTopsis;
            }
            
            if (selectedMethod == 'fuzzyWP') {
                jumlahObat = Math.floor((totalObat * point.properties.percentage.fuzzyWP) / 100);
                totalPersentase += point.properties.percentage.fuzzyWP;
            }

            totalObatCount += jumlahObat;

            distribusiObat.push({
                name: point.properties.name,
                percentage: selectedMethod == 'fuzzyTopsis' ? point.properties.percentage.fuzzyTopsis : point.properties.percentage.fuzzyWP,
                jumlahObat: jumlahObat,
                coordinates: [point.geometry.coordinates[1], point.geometry.coordinates[0]]
            });
        });

        // Adjusting the remaining difference
        let remainingObat = totalObat - totalObatCount;
        distribusiObat.sort((a, b) => b.percentage - a.percentage);
        for (let i = 0; remainingObat > 0; i = (i + 1) % distribusiObat.length) {
            distribusiObat[i].jumlahObat += 1;
            totalObatCount += 1;
            remainingObat -= 1;
        }

        // Add markers and update table
        distribusiObat.forEach(point => {
            const marker = L.marker(point.coordinates);
            marker.bindPopup(`${point.name}: ${point.jumlahObat} obat`);
            marker.addTo(markersLayer);

            const row = tableBody.insertRow();
            const cellName = row.insertCell(0);
            const cellPercentage = row.insertCell(1);
            const cellJumlahObat = row.insertCell(2);
            cellName.innerHTML = point.name;
            cellPercentage.innerHTML = point.percentage;
            cellJumlahObat.innerHTML = point.jumlahObat;
        });

        console.log(totalPersentase, totalObatCount);
        // Update total persentase dan total jumlah obat
        document.getElementById('totalPercentage').textContent = totalPersentase.toFixed(2);
        document.getElementById('totalObatCount').textContent = totalObatCount;
    }
});
