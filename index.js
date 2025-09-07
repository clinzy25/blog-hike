// Navbar component
function createNavbar() {
  return `
    <nav>
      <img src="https://clinzy-blog-assts.s3.us-west-2.amazonaws.com/dougfir.JPG" alt="Home" onclick="window.location.href='/blog-hike'"/>
      <h1>Hikeblogthing</h1>
    </nav>
  `;
}

// Function to load navbar on any page
function loadNavbar() {
  const navbarContainer = document.getElementById("navbar-container");
  if (navbarContainer) {
    navbarContainer.innerHTML = createNavbar();
  }
}

// Load navbar when DOM is ready
document.addEventListener("DOMContentLoaded", loadNavbar);

// File upload functionality
function createS3Upload() {
  const s3 = new AWS.S3({
    region: "us-west-2",
    accessKeyId: "",
    secretAccessKey: "",
  });

  // Upload file to S3
  async function uploadFile(file) {
    // Create and show loading icon
    const loadingElement = document.createElement("div");
    loadingElement.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 5px;
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 10px;
      ">
        <div style="
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        Uploading ${file.name}...
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loadingElement);

    const key = `${Date.now()}-${file.name}`;
    const params = {
      Bucket: "clinzy-blog-assts",
      Key: key,
      Body: file,
      ContentType: file.type,
    };

    try {
      const result = await s3.upload(params).promise();
      console.log("File uploaded successfully:", result.Location);
      return result.Location;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      // Remove loading icon
      document.body.removeChild(loadingElement);
    }
  }

  // Add media element to page
  function addMediaToPage(url, file) {
    const main = document.querySelector("main") || document.body;
    const mediaContainer = document.createElement("div");

    let htmlSnippet = "";

    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = url;
      img.className = "post-image";
      img.alt = file.name;
      mediaContainer.appendChild(img);
      htmlSnippet = `<img src="${url}" class="post-image" alt="${file.name}" />`;
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = url;
      video.className = "post-video";
      video.controls = true;
      mediaContainer.appendChild(video);
      htmlSnippet = `<video src="${url}" class="post-video" controls></video>`;
    }

    // Optional: Show in an alert or copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(htmlSnippet);
      alert(`Image uploaded! HTML copied to clipboard:\n${htmlSnippet}`);
    } else {
      alert(`Image uploaded! Copy this HTML:\n${htmlSnippet}`);
    }
  }

  // Handle file drop
  async function handleFileDrop(files) {
    // Upload each file
    for (const file of files) {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        try {
          const url = await uploadFile(file);
          addMediaToPage(url, file);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          alert(`Failed to upload ${file.name}`);
        }
      } else {
        console.warn(`Unsupported file type: ${file.type}`);
      }
    }
  }

  // Set up drag and drop event listeners
  function setupDragAndDrop() {
    // Prevent default drag behaviors on all these events
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      document.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    document.addEventListener("dragover", (e) => {
      e.dataTransfer.dropEffect = "copy";
    });

    document.addEventListener("drop", (e) => {
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileDrop(files);
      }
    });

    // Visual feedback for drag operations
    document.addEventListener("dragenter", (e) => {
      document.body.style.backgroundColor = "#e8f4f8";
    });

    document.addEventListener("dragleave", (e) => {
      if (!document.body.contains(e.relatedTarget)) {
        document.body.style.backgroundColor = "";
      }
    });

    document.addEventListener("drop", (e) => {
      document.body.style.backgroundColor = "";
    });
  }

  return { setupDragAndDrop };
}

// Initialize file upload functionality (development mode only)
document.addEventListener("DOMContentLoaded", () => {
  // Only enable file upload in development mode
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    const uploader = createS3Upload();
    uploader.setupDragAndDrop();
  }
});

// Enlarge image on click functionality
document.addEventListener("DOMContentLoaded", () => {
  // Add click event listeners to all post images
  document.querySelectorAll(".post-image").forEach((img) => {
    img.addEventListener("click", () => {
      enlargeImage(img);
    });
  });
});
function enlargeImage(img) {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "clicked-image-overlay";

  // Create enlarged image
  const enlargedImg = document.createElement("img");
  enlargedImg.src = img.src;
  enlargedImg.alt = img.alt;
  enlargedImg.className = "clicked-image";

  // Add image to overlay
  overlay.appendChild(enlargedImg);

  // Add overlay to document
  document.body.appendChild(overlay);

  // Close on click
  overlay.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  // Close on escape key
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      document.body.removeChild(overlay);
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);
}
