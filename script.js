// Inisiasi peta
var map = L.map('map').setView([-7.5, 112.5], 8);

// Tambahkan basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Objek untuk menyimpan layer GeoJSON tiap tahun
var geojsonLayers = {};


//========1.FUNGSI UNTUK MODEL PREDIKSI KEKERINGAN (2025-2035)========//
// Tahun-tahun yang tersedia
var years = Array.from({ length: 2035 - 2025 + 1 }, (_, i) => 2025 + i);

//// === Fungsi Pewarnaan Berdasarkan Nilai DN === ///
function getColor(dn) {
  return dn === 1 ? '#2c7bb6' :   // Sangat Rendah
         dn === 2 ? '#abd9e9' :   // Rendah
         dn === 3 ? '#ffffbf' :   // Sedang
         dn === 4 ? '#fdae61' :   // Tinggi
         dn === 5 ? '#d7191c' :   // Sangat Tinggi
         '#ccc'; // Default/Unknown
}

// === Fungsi Style untuk GeoJSON === //
function style(feature) {
  return {
    fillColor: getColor(feature.properties?.DN),
    weight: 1,
    opacity: 1,
    color: 'transparant',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

// === Fungsi Memuat GeoJSON dan Simpan ke Layer === //
function loadGeoJsonLayer(year) {
  fetch(`Data/PetaPrediksiKekeringan/${year}.geojson`)
    .then(res => {
      if (!res.ok) throw new Error(`Gagal memuat ${year}.geojson`);
      return res.json();
    })
    .then(data => {
      let layer = L.geoJSON(data, {
        style: style,
        onEachFeature: (feature, layer) => {
          const dn = feature.properties?.DN ?? 'N/A';
          layer.bindPopup(`Tahun: ${year}<br>DN: ${dn}`);
        }
      });
      geojsonLayers[year] = layer;
    })
    .catch(err => console.error(err));
}

// === Sidebar Checkbox untuk Mengontrol Layer === //
const form = document.getElementById("layerForm");
years.forEach(year => {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `layer-${year}`;
  checkbox.value = year;

  const label = document.createElement("label");
  label.htmlFor = checkbox.id;
  label.textContent = ` ${year}`;

  const br = document.createElement("br");

  checkbox.addEventListener("change", function () {
    const layer = geojsonLayers[year];
    if (this.checked) {
      if (layer) {
        layer.addTo(map);
      }
    } else {
      if (layer) {
        map.removeLayer(layer);
      }
    }
  });

  form.appendChild(checkbox);
  form.appendChild(label);
  form.appendChild(br);

  // Muat data awal
  loadGeoJsonLayer(year);
});


//========2.FUNGSI UNTUK PETA KERAWANAN KEKERINGAN========//
// ===== Semua Layers dalam satu objek =====
var layers = {
  VHI: L.geoJSON(null, {
    style: feature => ({
      fillColor: getColorVHI(feature.properties.DN),
      color: 'transparent',
      weight: 1,
      fillOpacity: 1
    })
  }),
  LST: L.geoJSON(null, {
    style: feature => ({
      fillColor: getColorLST(feature.properties.DN),
      color: 'transparent',
      weight: 1,
      fillOpacity: 1
    })
  }),
  Kerawanan: L.geoJSON(null, {
    style: feature => ({
      fillColor: getColorKer(feature.properties.DN),
      color: 'transparent',
      weight: 1,
      fillOpacity: 1
    })
  }),
  SPD: L.geoJSON(null, {
    style: feature => ({
      fillColor: getColorSPD(feature.properties.DN),
      color: 'transparent',
      weight: 1,
      fillOpacity: 1
    })
  }),
  JARAK: L.geoJSON(null, {
    style: feature => ({
      fillColor: getColorSPD(feature.properties.DN),
      color: 'transparent',
      weight: 1,
      fillOpacity: 1
    })
  })
};

// ===== Muat GeoJSON (pastikan path benar) =====
fetch('Data/PetaKerawananKekeringan/VHI.geojson')
  .then(res => res.json()).then(data => layers.VHI.addData(data));
fetch('Data/PetaKerawananKekeringan/LST(RF).geojson')
  .then(res => res.json()).then(data => layers.LST.addData(data));
fetch('Data/PetaKerawananKekeringan/KERAWANAN.geojson')
  .then(res => res.json()).then(data => layers.Kerawanan.addData(data));
fetch('Data/SistemPeringatanDiniKekeringan/PERINGATANDINI.geojson')
  .then(res => res.json()).then(data => layers.SPD.addData(data));
fetch('Data/SistemPeringatanDiniKekeringan/JARAK.geojson')
  .then(res => res.json()).then(data => layers.JARAK.addData(data));

// ===== Checkbox Event Handler hanya sekali =====
document.querySelectorAll('.layer-toggle').forEach(checkbox => {
  checkbox.addEventListener('change', function () {
    const layerId = this.dataset.layer;
    const layer = layers[layerId];
    if (layer) {
      if (this.checked) {
        layer.addTo(map);
      } else {
        map.removeLayer(layer);
      }
    }
  });
});

// ===== Fungsi Pewarnaan =====
function getColorVHI(dn) {
  return dn >= 1 && dn < 2 ? '#C0D6E8' : //sangat rendah
         dn >= 2 && dn < 3 ? '#2D5C7F' : //rendah
         dn >= 3 && dn < 4 ? '#FFF1A8' : //sedang
         dn >= 4 && dn < 5 ? '#FF8F56' : //tinggi
         dn >= 5 ? '#984A59' : //sangat tinggi
         '#ccc'; 
}

function getColorLST(dn) {
  return dn >= 1 && dn < 2 ? '#C0D6E8' : //sangat rendah
         dn >= 2 && dn < 3 ? '#2D5C7F' : //rendah
         dn >= 3 && dn < 4 ? '#FFF1A8' : //sedang
         dn >= 4 && dn < 5 ? '#FF8F56' : //tinggi
         dn >= 5 ? '#984A59' : //sangat tinggi
         '#ccc';
}

function getColorKer(dn) {
  return dn >= 1 && dn < 2 ? '#C0D6E8' : //sangat rendah
         dn >= 2 && dn < 3 ? '#2D5C7F' : //rendah
         dn >= 3 && dn < 4 ? '#FFF1A8' : //sedang
         dn >= 4 && dn < 5 ? '#FF8F56' : //tinggi
         dn >= 5 ? '#984A59' : //sangat tinggi
         '#ccc';
}

function getColorSPD(dn) {
  return dn === 0 ? '#B9BC6D' :   // Normal
         dn === 2 ? '#FFE894' :   // Siaga
         dn === 3 ? '#EF765F' :   // Waspada
         dn === 4 ? '#95415A' :   // Awas
         '#ccc';
}

function getColorJARAK(dn) {
  return dn === 0 ? '#B9BC6D' :   // Normal
         dn === 2 ? '#FFE894' :   // Siaga
         dn === 3 ? '#EF765F' :   // Waspada
         dn === 4 ? '#95415A' :   // Awas
         '#ccc';
}

// Inisialisasi
var rekomendasiLayers = {};
var currentRekomendasiLayer = null;
var loadedLayers = {};  // Menyimpan status loading layer

const bulanList = [
  "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
  "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
];

const getColorByDN = (dn) => {
  return dn === 0 ? "#95415A" :  //Tidak bisa
         dn === 2 ? "#B9BC6D" :  //Sangat cocok
         dn === 3 ? "#FFE894" :  //Cocok
         dn === 4 ? "#EF765F" :  //Tidak Cocok
                    "#cccccc";
};

// Muat GeoJSON untuk setiap bulan
bulanList.forEach(function (bulan) {
  fetch(`Data/PetaRekomendasiTanamanAdaptif/${bulan}.geojson`)
    .then(response => response.json())
    .then(data => {
      const layer = L.geoJSON(data, {
        style: function (feature) {
          const dn = feature.properties.DN;
          return {
            color: getColorByDN(dn),
            weight: 1,
            fillOpacity: 1
          };
        },
        onEachFeature: function (feature, layer) {
          const komoditas = feature.properties.komoditas || 'Tanaman';
          layer.bindPopup(`<strong>Rekomendasi:</strong> ${komoditas}<br><strong>DN:</strong> ${feature.properties.DN}`);
        }
      });

      rekomendasiLayers[bulan] = layer;
      loadedLayers[bulan] = true;
    })
    .catch(error => {
      console.warn(`Gagal memuat data bulan ${bulan}:`, error);
      loadedLayers[bulan] = false;
    });
});

document.getElementById('month-selector').addEventListener('change', function () {
  const selectedMonthIndex = parseInt(this.value) - 1;
  const selectedMonthName = bulanList[selectedMonthIndex];

  if (currentRekomendasiLayer) {
    map.removeLayer(currentRekomendasiLayer);
    currentRekomendasiLayer = null;
  }

  if (!(selectedMonthName in rekomendasiLayers)) {
    document.getElementById('monthly-recommendation').innerHTML =
      `<p><em>Data belum tersedia untuk bulan ini.</em></p>`;
    legend.getContainer().style.display = "none";
    return;
  }

  const newLayer = rekomendasiLayers[selectedMonthName];
  if (newLayer) {
    newLayer.addTo(map);
    currentRekomendasiLayer = newLayer;

    document.getElementById('monthly-recommendation').innerHTML =
      `<p>Menampilkan rekomendasi tanam untuk bulan <strong>${this.options[this.selectedIndex].text}</strong>.</p>`;

  }
});







