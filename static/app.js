document.getElementById("predictForm").addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const json = Object.fromEntries(formData.entries());
  
    const r = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(json)
    });
    const data = await r.json();
    document.getElementById("result").textContent = JSON.stringify(data, null, 2);
  });