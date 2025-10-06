document.addEventListener("DOMContentLoaded", function () {
    
  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.querySelector(".nav-menu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("show");
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
    });
  }

  var filterInput = document.querySelector('[data-js="filter-input"]');
  var filterList = document.querySelector('[data-js="filter-list"]');
  var filterCount = document.querySelector('[data-js="filter-count"]');

  function filterResources() {
    var query = filterInput.value.toLowerCase();
    var items = filterList ? filterList.querySelectorAll("[data-tag]") : [];
    var visible = 0;
    items.forEach(function (item) {
      var text = item.textContent.toLowerCase();
      var tags = (item.getAttribute("data-tag") || "").toLowerCase();
      var match =
        query === "" || text.indexOf(query) > -1 || tags.indexOf(query) > -1;
      item.hidden = !match;
      if (match) visible++;
    });
    if (filterCount) {
      filterCount.textContent = visible + " result" + (visible === 1 ? "" : "s");
    }
  }

  if (filterInput && filterList) {
    filterInput.addEventListener("input", filterResources);
    filterResources();
  }


  var form = document.querySelector('[data-js="contact-form"]');
  var errorBox = document.querySelector('[data-js="form-errors"]');

  function checkForm(e) {
    var errors = [];
    var nameEl = form ? form.querySelector('[name="name"]') : null;
    var emailEl = form ? form.querySelector('[name="email"]') : null;
    var msgEl = form ? form.querySelector('[name="message"]') : null;

    var name = nameEl ? nameEl.value.trim() : "";
    var email = emailEl ? emailEl.value.trim() : "";
    var message = msgEl ? msgEl.value.trim() : "";

    if (name.length < 2) {
      errors.push("Name must be at least 2 characters.");
    }
    if (email.indexOf("@") === -1 || email.indexOf(".") === -1) {
      errors.push("Please enter a valid email.");
    }
    if (message.length < 10) {
      errors.push("Message must be at least 10 characters.");
    }

    if (errors.length > 0) {
      e.preventDefault();
      if (errorBox) {
        errorBox.innerHTML =
          "<ul>" +
          errors.map(function (x) {
            return "<li>" + x + "</li>";
          }).join("") +
          "</ul>";
        errorBox.hidden = false;
        errorBox.focus();
      }
    } else if (errorBox) {
      errorBox.hidden = true;
      errorBox.innerHTML = "";
    }
  }

  if (form) {
    form.addEventListener("submit", checkForm);
  }

  var clearBtn = document.getElementById("clearDataBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      try {
        localStorage.clear();
        sessionStorage.clear();
        if (typeof setTheme === "function") {
          setTheme("light");
        } else {
          document.body.classList.remove("dark");
          document.body.classList.add("light");
        }
        alert("Data cleared.");
      } catch (e) {
        console.error(e);
        alert("Could not clear data.");
      }
    });
  }
});