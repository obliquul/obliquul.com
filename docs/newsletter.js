function submitHandler(event) {
  event.preventDefault();
  var container = event.target.parentNode;
  var form = container.querySelector(".newsletter-form");
  var formInput = container.querySelector(".newsletter-form-input");
  var successContainer = container.querySelector(".newsletter-toast-success");
  var success = container.querySelector(".newsletter-toast-success-message");
  var errorContainer = container.querySelector(".newsletter-toast-error");
  var errorMessage = container.querySelector(".newsletter-toast-success-message");
  var submitButton = container.querySelector(".newsletter-form-button");
  var loadingButton = container.querySelector(".newsletter-loading-button");

  const rateLimit = () => {
    errorContainer.style.display = "flex";
    errorMessage.innerText = "Too many signups, try again later.";
  }

  // Compare current time with time of previous sign up
  var time = new Date();
  var timestamp = time.valueOf();
  var previousTimestamp = localStorage.getItem("newsletter-form-timestamp");

  // If last sign up was less than a minute ago
  // display error
  if (previousTimestamp && Number(previousTimestamp) + 60000 > timestamp) {
    rateLimit();
    return;
  }
  localStorage.setItem("newsletter-form-timestamp", timestamp);


  loadingButton.style.display = "flex";

  var formBody = "userGroup=PreObliquulLaunch&email=" + encodeURIComponent(formInput.value);
  fetch(event.target.action, {
    method: "POST",
    body: formBody,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((res) => [res.ok, res.json(), res])
    .then(([ok, dataPromise, res]) => {
      if (ok) {
        // If response successful
        // display success
        success.style.display = "flex";
        form.reset();
      } else {
        // If response unsuccessful
        // display error message or response status
        dataPromise.then(data => {
          errorContainer.style.display = "flex";
          errorMessage.innerText = data.message
            ? data.message
            : res.statusText;
        });
      }
    })
    .catch(error => {
      // check for cloudflare error
      if (error.message === "Failed to fetch") {
        rateLimit();
        return;
      }
      // If error caught
      // display error message if available
      errorContainer.style.display = "flex";
      if (error.message) errorMessage.innerText = error.message;
      localStorage.setItem("newsletter-form-timestamp", '');
    })
    .finally(() => {
      loadingButton.style.display = "none";
      backButton.style.display = "block";
    });
}

var formContainers = document.getElementsByClassName(
  "newsletter-form-container"
);

for (var i = 0; i < formContainers.length; i++) {
  var formContainer = formContainers[i];
  var handlersAdded = formContainer.classList.contains('newsletter-handlers-added');
  if (handlersAdded) continue;
  formContainer
    .querySelector(".newsletter-form")
    .addEventListener("submit", submitHandler);
  formContainer.classList.add("newsletter-handlers-added");
}