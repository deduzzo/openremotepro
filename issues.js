// Vetrina delle segnalazioni: issue pubbliche di deduzzo/openremotepro (API GitHub senza login).
// Tutto il testo delle issue entra con textContent: mai HTML da GitHub nella pagina.
(function () {
  var box = document.getElementById("issues");
  if (!box) return;
  var en = document.documentElement.lang !== "it";
  var T = en
    ? { open: "Open", confermato: "Confirmed", "in-lavorazione": "In progress", risolto: "Fixed, coming in the next update", rilasciato: "Fixed in", bug: "Bug", richiesta: "Feature request",
        none: "No open reports right now.", err: "Couldn't load the list: see it on GitHub.", released: "Recently fixed", current: "Open reports",
        planned: "Coming next", news: "New in version", programma: "Planned", novita: "New" }
    : { open: "Aperta", confermato: "Confermata", "in-lavorazione": "In lavorazione", risolto: "Risolta, in arrivo col prossimo aggiornamento", rilasciato: "Risolta nella", bug: "Bug", richiesta: "Richiesta",
        none: "Nessuna segnalazione aperta in questo momento.", err: "Non riesco a caricare l'elenco: guardalo su GitHub.", released: "Risolte di recente", current: "Segnalazioni aperte",
        planned: "In arrivo", news: "Novità della versione", programma: "In programma", novita: "Novità" };
  var ORDER = ["in-lavorazione", "confermato", "risolto"];

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function has(i, l) { return i.labels.some(function (x) { return x.name === l; }); }
  function status(i) {
    var n = i.labels.map(function (l) { return l.name; });
    if (n.indexOf("novita") >= 0) return "novita";
    if (n.indexOf("in-programma") >= 0 && i.state === "open") return "programma";
    if (n.indexOf("rilasciato") >= 0) return "rilasciato";
    for (var k = 0; k < ORDER.length; k++) if (n.indexOf(ORDER[k]) >= 0) return ORDER[k];
    return "open";
  }
  function item(i) {
    var s = status(i), names = i.labels.map(function (l) { return l.name; });
    var a = el("a", "issue"); a.href = i.html_url; a.rel = "noopener";
    var head = el("span", "issue-head");
    head.appendChild(el("span", "issue-status s-" + s, s === "rilasciato" && i.milestone ? T.rilasciato + " " + i.milestone.title : T[s] || T.open));
    if (s !== "novita" && s !== "programma") head.appendChild(el("span", "issue-kind", names.indexOf("richiesta") >= 0 ? T.richiesta : T.bug));
    if (names.indexOf("ios") >= 0) head.appendChild(el("span", "issue-kind", "iPad/iPhone"));
    if (names.indexOf("android") >= 0) head.appendChild(el("span", "issue-kind", "Android"));
    head.appendChild(el("span", "issue-num", "#" + i.number));
    a.appendChild(head);
    a.appendChild(el("span", "issue-title", i.title));
    return a;
  }
  function list(title, items) {
    if (!items.length) return;
    box.appendChild(el("h3", "issues-h", title));
    var ul = el("div", "issues-list");
    items.forEach(function (i) { ul.appendChild(item(i)); });
    box.appendChild(ul);
  }
  fetch("https://api.github.com/repos/deduzzo/openremotepro/issues?state=all&per_page=60&sort=updated", { headers: { Accept: "application/vnd.github+json" } })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (all) {
      box.textContent = "";
      var issues = all.filter(function (i) { return !i.pull_request && i.state_reason !== "not_planned"; });
      var showcase = function (i) { return has(i, "novita") || has(i, "in-programma"); };
      var open = issues.filter(function (i) { return i.state === "open" && !showcase(i); })
        .sort(function (a, b) { return ORDER.indexOf(status(b)) - ORDER.indexOf(status(a)); });
      var month = Date.now() - 45 * 864e5;
      var done = issues.filter(function (i) { return i.state === "closed" && !showcase(i) && status(i) === "rilasciato" && new Date(i.closed_at).getTime() > month; });
      var planned = issues.filter(function (i) { return i.state === "open" && has(i, "in-programma"); });
      var news = issues.filter(function (i) { return has(i, "novita") && i.state === "closed"; });
      // novità raggruppate per versione (milestone), la più recente prima
      var byVer = {};
      news.forEach(function (i) { var v = i.milestone ? i.milestone.title : "—"; (byVer[v] = byVer[v] || []).push(i); });
      var vers = Object.keys(byVer).sort(function (a, b) { return b.localeCompare(a, undefined, { numeric: true }); });
      list(T.planned, planned);
      list(T.current, open);
      if (!open.length) box.appendChild(el("p", "muted", T.none));
      list(T.released, done);
      vers.forEach(function (v) { list(T.news + " " + v, byVer[v]); });
    })
    .catch(function () { box.textContent = ""; box.appendChild(el("p", "muted", T.err)); });
})();
