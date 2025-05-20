
    document.getElementById("home-link").addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    document.getElementById("import/export-link").addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("page-container").scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("eggconsumption-link").addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("bubble-chart-page").scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("EU-map-link").addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("worldmap").scrollIntoView({ behavior: "smooth" });
    });

    
