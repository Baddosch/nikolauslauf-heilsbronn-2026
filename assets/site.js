(function () {
  "use strict";

  var races = [
    { key: "Minis", label: "Minis" },
    { key: "U8", label: "U8" },
    { key: "U10", label: "U10" },
    { key: "U12", label: "U12" },
    { key: "U14U16", label: "U14 und U16", tab: "U14/U16" },
    { key: "Maenner", label: "U18 männlich und Männer", tab: "Männer/U18" },
    { key: "Damen", label: "U18 weiblich und Damen", tab: "Damen/U18" }
  ];

  function status(message, isError) {
    var root = document.getElementById("data");
    root.className = "status" + (isError ? " error" : "");
    root.textContent = message;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function apiUrl(action) {
    var configured = window.NIKOLAUSLAUF_CONFIG && window.NIKOLAUSLAUF_CONFIG.apiUrl;
    if (!configured) {
      throw new Error("Die Datenanbindung ist noch nicht eingerichtet.");
    }
    return configured + (configured.indexOf("?") === -1 ? "?" : "&") + "action=" + encodeURIComponent(action);
  }

  function fetchData(action) {
    return Promise.resolve().then(function () {
      return fetch(apiUrl(action));
    }).then(function (response) {
      if (!response.ok) throw new Error("Der Datenserver antwortet mit HTTP " + response.status + ".");
      return response.json();
    }).then(function (data) {
      if (!data || data.error) throw new Error(data && data.error ? data.error : "Unerwartetes Datenformat.");
      return data;
    });
  }

  function table(headers, rows) {
    var html = '<div class="table-wrap"><table><thead><tr>';
    headers.forEach(function (header) { html += "<th>" + escapeHtml(header) + "</th>"; });
    html += "</tr></thead><tbody>";
    rows.forEach(function (row) {
      html += "<tr>";
      headers.forEach(function (header) { html += "<td>" + escapeHtml(row[header]) + "</td>"; });
      html += "</tr>";
    });
    return html + "</tbody></table></div>";
  }

  function renderParticipants(data) {
    var root = document.getElementById("data");
    var maxParticipants = 80;
    var html = '<div class="tabs" role="tablist" aria-label="Rennen">';
    races.forEach(function (race, index) {
      html += '<button type="button" role="tab" id="tab-' + race.key + '" aria-controls="panel-' + race.key +
        '" aria-selected="' + (index === 0 ? "true" : "false") + '">' + escapeHtml(race.tab || race.label) +
        " (" + (data[race.key] || []).length + ")</button>";
    });
    html += "</div>";

    races.forEach(function (race, raceIndex) {
      var participants = data[race.key] || [];
      var filledPlaces = Math.min(participants.length, maxParticipants);
      var percent = filledPlaces / maxParticipants * 100;
      html += '<section class="race" role="tabpanel" id="panel-' + race.key + '" aria-labelledby="tab-' +
        race.key + '"' + (raceIndex === 0 ? "" : " hidden") + '><div class="race-header"><h2>' +
        escapeHtml(race.label) + '</h2><span class="race-count">' + participants.length + " / " +
        maxParticipants + ' Teilnehmer</span><div class="capacity-bar" role="progressbar" aria-label="Belegte Startplätze" aria-valuemin="0" aria-valuemax="' +
        maxParticipants + '" aria-valuenow="' + filledPlaces + '" aria-valuetext="' + participants.length +
        ' von ' + maxParticipants + ' Startplätzen belegt"><div class="capacity-fill" style="width:' +
        percent + '%"></div></div></div>';
      if (!participants.length) {
        html += '<p class="empty">Noch keine veröffentlichten Anmeldungen.</p>';
      } else {
        ["Minis", "U8", "U10", "U12", "U14", "U16", "U18", "Erwachsene", "Unbekannt"].forEach(function (ageGroup) {
          ["Weiblich", "Männlich", "Unbekannt"].forEach(function (gender) {
            var group = participants.filter(function (person) {
              return (person.altersklasse || "Unbekannt") === ageGroup &&
                (person.geschlecht || "Unbekannt") === gender;
            });
            if (!group.length) return;
            html += '<h3 class="subheading">' + escapeHtml(ageGroup + " – " + gender) +
              " (" + group.length + ")</h3>";
            html += table(["#", "Name", "Verein/Team"], group.map(function (person, index) {
              return { "#": index + 1, "Name": person.name, "Verein/Team": person.team };
            }));
          });
        });
      }
      html += "</section>";
    });
    root.className = "";
    root.innerHTML = html;
    root.querySelectorAll('[role="tab"]').forEach(function (tab) {
      tab.addEventListener("click", function () {
        root.querySelectorAll('[role="tab"]').forEach(function (item) {
          item.setAttribute("aria-selected", item === tab ? "true" : "false");
        });
        root.querySelectorAll('[role="tabpanel"]').forEach(function (panel) {
          panel.hidden = panel.id !== tab.getAttribute("aria-controls");
        });
      });
    });
  }

  function renderResults(data) {
    var root = document.getElementById("data");
    var raceIds = Object.keys(data).sort(function (a, b) {
      return races.findIndex(function (race) { return race.key === a; }) -
        races.findIndex(function (race) { return race.key === b; });
    });
    if (!raceIds.length) {
      status("Noch keine Ergebnisse veröffentlicht.", false);
      return;
    }

    var html = "";
    raceIds.forEach(function (id) {
      var race = data[id] || {};
      var label = races.find(function (item) { return item.key === id; });
      html += '<section class="race"><h2>' + escapeHtml(label ? label.label : "Rennen " + id) + "</h2>";
      (race.categories || []).forEach(function (category) {
        var ageGroup = String(category.ageGroup || "").replace(/^AK_/, "");
        var title = [ageGroup, category.gender].filter(Boolean).join(" – ");
        html += '<h3 class="subheading">' + escapeHtml(title) + "</h3>";
        var rows = category.results || [];
        if (rows.length) {
          html += table(["Platz", "Name", "Verein/Team", "Zeit", "Stadtmeister-Platz"], rows.map(function (row) {
            return {
              "Platz": row["Platz"],
              "Name": row["Name"],
              "Verein/Team": row["Verein/Team"],
              "Zeit": row["Zeit"],
              "Stadtmeister-Platz": row["Stadtmeister-Platz"] || "–"
            };
          }));
        } else {
          html += '<p class="empty">Noch keine Ergebnisse in dieser Wertung.</p>';
        }
      });
      if (!(race.categories || []).length) {
        html += '<p class="empty">Noch keine Ergebnisse veröffentlicht.</p>';
      }
      html += "</section>";
    });
    root.className = "";
    root.innerHTML = html;
  }

  var page = document.body.getAttribute("data-page");
  if (!page) return;

  fetchData(page === "teilnehmer" ? "getTeilnehmer" : "getErgebnisse")
    .then(page === "teilnehmer" ? renderParticipants : renderResults)
    .catch(function (error) {
      status(error.message || "Die Daten konnten nicht geladen werden.", true);
    });
})();
