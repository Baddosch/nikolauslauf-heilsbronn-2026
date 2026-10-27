(function () {
  "use strict";

  var races = [
    { key: "Minis", label: "Minis (Jahrgänge 2021–2022)" },
    { key: "U8", label: "U8 (Jahrgänge 2019–2020)" },
    { key: "U10", label: "U10 (Jahrgänge 2017–2018)" },
    { key: "U12", label: "U12 (Jahrgänge 2015–2016)" },
    { key: "U14", label: "U14 (Jahrgänge 2013–2014)" },
    { key: "U16", label: "U16 (Jahrgänge 2011–2012)" },
    { key: "U18m", label: "U18 männlich (Jahrgänge 2009–2010)" },
    { key: "Maenner", label: "Männer" },
    { key: "U18w", label: "U18 weiblich (Jahrgänge 2009–2010)" },
    { key: "Damen", label: "Damen" }
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
    var html = "";
    races.forEach(function (race) {
      var participants = data[race.key] || [];
      html += '<section class="race"><h2>' + escapeHtml(race.label) + " (" + participants.length + ')</h2>';
      if (!participants.length) {
        html += '<p class="empty">Noch keine veröffentlichten Anmeldungen.</p>';
      } else {
        ["Weiblich", "Männlich", "Unbekannt"].forEach(function (gender) {
          var group = participants.filter(function (person) {
            return (person.geschlecht || "Unbekannt") === gender;
          });
          if (!group.length) return;
          html += '<h3 class="subheading">' + escapeHtml(gender) + " (" + group.length + ')</h3>';
          html += table(["#", "Name", "Team/Verein"], group.map(function (person, index) {
            return { "#": index + 1, "Name": person.name, "Team/Verein": person.team };
          }));
        });
      }
      html += "</section>";
    });
    root.className = "";
    root.innerHTML = html;
  }

  function renderResults(data) {
    var root = document.getElementById("data");
    var raceIds = Object.keys(data).sort(function (a, b) {
      return String(a).localeCompare(String(b), "de", { numeric: true });
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
          var publicHeaders = ["Platz", "Name", "Zeit", "Team/Verein"];
          var headers = publicHeaders.filter(function (header) {
            return rows.some(function (row) { return Object.prototype.hasOwnProperty.call(row, header); });
          });
          if (headers.length) {
            html += table(headers, rows);
          } else {
            html += '<p class="empty">Ergebnisdaten liegen vor, aber es sind keine freigegebenen Anzeigefelder vorhanden.</p>';
          }
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
