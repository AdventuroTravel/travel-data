// search-geo.js

document.addEventListener("DOMContentLoaded", () => {
  // flatpickr
  flatpickr("#date", {
    mode: "range",
    dateFormat: "d.m.Y",
    locale: "de"
  });

  // dynamische Kinderfelder
  document.getElementById("children").addEventListener("change", function () {
    const count = parseInt(this.value);
    const container = document.getElementById("children-ages");
    container.innerHTML = "";
    for (let i = 1; i <= count; i++) {
      const input = document.createElement("input");
      input.type = "number";
      input.placeholder = `Alter Kind ${i}`;
      input.min = 0;
      input.max = 17;
      input.classList.add("child-age");
      input.style.marginTop = "4px";
      container.appendChild(input);
    }
  });

  // Reiseziel Autocomplete via GeoDB
  new autoComplete({
    selector: "#destination",
    placeHolder: "Reiseziel eingeben",
    data: {
      src: async (query) => {
        try {
          const response = await fetch(
            `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}&limit=10&types=CITY`,
            {
              method: "GET",
              headers: {
                "X-RapidAPI-Key": "37d2402480msh172ac30d2a72a91p14f8b5jsn540ee6229d1a",
                "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
              }
            }
          );
          const data = await response.json();
          return data.data.map(
            (city) => `${city.city}, ${city.countryCode}`
          );
        } catch (error) {
          console.error("Fehler bei GeoDB:", error);
          return [];
        }
      },
      cache: false
    },
    resultItem: { highlight: true },
    events: {
      input: {
        selection: (event) => {
          document.querySelector("#destination").value =
            event.detail.selection.value;
        }
      }
    }
  });

  // Airport Autocomplete
  fetch("https://adventurotravel.github.io/travel-data/filtered_airports_with_CH.json")
    .then((res) => res.json())
    .then((data) => {
      const airports = data.map(
        (a) => `${a.city} (${a.iata}) - ${a.name}`
      );
      new autoComplete({
        selector: "#airport",
        placeHolder: "Abflughafen eingeben",
        data: { src: airports },
        resultItem: { highlight: true },
        events: {
          input: {
            selection: (e) => {
              document.querySelector("#airport").value =
                e.detail.selection.value;
            }
          }
        }
      });
    })
    .catch((err) => {
      console.error("Fehler beim Laden der Airport-JSON:", err);
    });

  // mobiles Aufklappen
  document.getElementById("destination").addEventListener("focus", () => {
    if (window.innerWidth <= 600) {
      document.querySelector(".search-form").classList.add("expanded");
    }
  });
});

// Search submit
function handleSearch(e) {
  e.preventDefault();
  const airport = document.getElementById("airport").value;
  const destination = document.getElementById("destination").value;
  const date = document.getElementById("date").value;
  const duration = document.getElementById("duration").value;
  const adults = document.getElementById("adults").value;
  const children = document.getElementById("children").value;
  const childrenAges = Array.from(
    document.querySelectorAll(".child-age")
  )
    .map((el) => el.value)
    .join(",");
  alert(`Abflughafen: ${airport}
Ziel: ${destination}
Datum: ${date}
Dauer: ${duration}
Erwachsene: ${adults}
Kinder: ${children} (${childrenAges})`);
}
