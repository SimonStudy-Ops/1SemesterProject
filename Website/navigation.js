
    document.getElementById("home-link").addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    document.getElementById("eggconsumption-link").addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("eggconsumption").scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("worldmap-link").addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("worldmap").scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("import-link").addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("importContainer").scrollIntoView({ behavior: "smooth" });
    });
