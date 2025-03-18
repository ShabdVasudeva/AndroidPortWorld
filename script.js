const GITHUB_BASE_URL = "https://api.github.com/repos/shabdvasudeva/Channel-Updates/contents/";
const GITLAB_TREE_URL = "https://gitlab.com/api/v4/projects/68090229/repository/tree?ref=main";
const GITLAB_BASE_RAW = "https://gitlab.com/api/v4/projects/68090229/repository/files/";

document.getElementById("theme-toggle").addEventListener("click", () => {
  const body = document.documentElement;
  const isDark = body.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";
  
  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

document.getElementById("home-btn").addEventListener("click", () => {
  document.getElementById("content").style.display = "grid";
  document.getElementById("news").style.display = "none";
});

document.getElementById("news-btn").addEventListener("click", () => {
  document.getElementById("content").style.display = "none";
  document.getElementById("news").style.display = "block";
});

// Function to fetch all JSON files (GitHub first, then GitLab)
async function fetchAllJsonFiles() {
  document.getElementById("content").innerHTML = ""; // Clear content before fetching
  let allFiles = [];

  const githubFiles = await fetchJsonFromGitHub();
  const gitlabFiles = await fetchJsonFromGitLab();
  
  allFiles = [...githubFiles, ...gitlabFiles]; // Merge GitHub and GitLab files

  // Sort by most recent (assuming JSON includes a date or order mechanism)
  allFiles.reverse(); // Newest JSON entries appear first

  // Add each file's card to the DOM
  allFiles.forEach(file => {
    let imageUrl = file.source === "github"
      ? `https://raw.githubusercontent.com/shabdvasudeva/Channel-Updates/main/${file.img}`
      : `https://gitlab.com/shabdvasudeva/apw-database/-/raw/main/${file.img}`;
    
    createCard(file.title, file.instructions ?? "No description available", imageUrl, file.link);
  });
}

async function fetchJsonFromGitHub() {
  let filesList = [];
  try {
    let response = await fetch(GITHUB_BASE_URL);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    
    let files = await response.json();
    let jsonFiles = files.filter(file => file.name.endsWith(".json"));
    
    for (let file of jsonFiles) {
      let fileContent = await fetchFiles(file.download_url, "github");
      filesList.push(...fileContent);
    }
  } catch (error) {
    console.error("Error fetching GitHub repo contents:", error);
  }
  return filesList;
}

async function fetchJsonFromGitLab() {
  let filesList = [];
  try {
    let response = await fetch(GITLAB_TREE_URL);
    if (!response.ok) throw new Error(`GitLab API error: ${response.status}`);
    
    let files = await response.json();
    let jsonFiles = files.filter(file => file.name.endsWith(".json"));
    
    for (let file of jsonFiles) {
      let fileUrl = `${GITLAB_BASE_RAW}${encodeURIComponent(file.path)}/raw?ref=main`;
      let fileContent = await fetchFiles(fileUrl, "gitlab");
      filesList.push(...fileContent);
    }
  } catch (error) {
    console.error("Error fetching GitLab repo contents:", error);
  }
  return filesList;
}

async function fetchFiles(jsonUrl, source) {
  try {
    let response = await fetch(jsonUrl);
    if (!response.ok) throw new Error(`Error fetching JSON: ${jsonUrl} - Status: ${response.status}`);
    
    let files = await response.json();
    return files.map(file => ({ ...file, source })); // Attach source info
  } catch (error) {
    console.error(`Error fetching JSON from ${jsonUrl}:`, error);
    return [];
  }
}

// Function to create and insert cards at the TOP
function createCard(title, instructions, imageUrl, link) {
  let card = document.createElement("div");
  card.classList.add("card");
  
  let htmlContent = `
    <img src="${imageUrl}" alt="Banner">
    <p1>${title}</p1>
    <p>${instructions}</p>`;
  
  if (link) {
    htmlContent += `
      <div class="download-btn">
        <md-filled-button onclick="window.open('${link}', '_blank')">Download</md-filled-button>
      </div>`;
  }
  
  card.innerHTML = htmlContent;

  // Insert at the beginning (newest first)
  let contentDiv = document.getElementById("content");
  contentDiv.insertBefore(card, contentDiv.firstChild);
}

// Search functionality
document.getElementById("search").addEventListener("input", function() {
  let searchTerm = this.value.toLowerCase();
  document.querySelectorAll(".card").forEach(card => {
    let title = card.querySelector("p1").innerText.toLowerCase();
    card.style.display = title.includes(searchTerm) ? "block" : "none";
  });
});

// Fetch JSON files on page load
fetchAllJsonFiles();
