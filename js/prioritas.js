document.addEventListener('DOMContentLoaded', () => {
    // URL raw dari file CSV di GitHub
    const csvUrl = 'https://raw.githubusercontent.com/yuzzarr/ProjekSPK/main/Kota%20Prioritas.csv';

    // Fungsi untuk membaca CSV dan mengisi tabel
    function readCSVAndPopulateTable(url) {
        Papa.parse(url, {
            download: true,
            header: true,
            complete: function(results) {
                const data = results.data;
                const tableBody = document.getElementById('rankingTable').getElementsByTagName('tbody')[0];
                tableBody.innerHTML = ''; // Clear existing table rows

                data.forEach(row => {
                    if (row.persentaseFuzzyWp === undefined || row.persentaseFuzzyTopsis === undefined) {
                        return; // Skip this row
                    }

                    const tableRow = tableBody.insertRow();

                    const cellRanking = tableRow.insertCell(0);
                    const cellKotaFuzzyWP = tableRow.insertCell(1);
                    const cellPersentaseFuzzyWP = tableRow.insertCell(2);
                    const cellKotaFuzzyTopsis = tableRow.insertCell(3);
                    const cellPersentaseFuzzyTopsis = tableRow.insertCell(4);

                    cellRanking.innerHTML = row.Rangking;
                    cellKotaFuzzyWP.innerHTML = row.kotaFuzzyWp;
                    cellPersentaseFuzzyWP.innerHTML = row.persentaseFuzzyWp;
                    cellKotaFuzzyTopsis.innerHTML = row.kotaFuzzyTopsis;
                    cellPersentaseFuzzyTopsis.innerHTML = row.persentaseFuzzyTopsis;
                });
            }
        });
    }

    // Panggil fungsi untuk membaca CSV dan mengisi tabel
    readCSVAndPopulateTable(csvUrl);
});
