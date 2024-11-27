// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApVcE7qFeTHMZvxT3-4gcJ53TA1UxMMnw",
  authDomain: "the-abimbolas.firebaseapp.com",
  projectId: "the-abimbolas",
  storageBucket: "the-abimbolas.firebasestorage.app",
  messagingSenderId: "236717769916",
  appId: "1:236717769916:web:4ea0607deb4fd85fb5fcb9",
  measurementId: "G-0CFM4E8JYZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

// Image upload and preview functionality
document.addEventListener("DOMContentLoaded", () => {
  const uploadButton = document.getElementById("uploadButton");
  const fileInput = document.getElementById("fileInput");
  const uploadArea = document.getElementById("uploadArea");
  const gallery = document.getElementById("gallery");

  // Load existing images when the page loads
  loadExistingImages();

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
      uploadArea.classList.add('highlight');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
      uploadArea.classList.remove('highlight');
    }, false);
  });

  uploadArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  });

  async function handleFiles(files) {
    showImagePreviews(files);
    uploadButton.disabled = true;
    uploadButton.textContent = 'Uploading...';

    try {
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const timestamp = Date.now();
          const fileName = `${timestamp}_${file.name}`;
          const storageRef = ref(storage, `images/${fileName}`);
          
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          displayImage(downloadURL);
        }
      }
      showNotification('Images uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error uploading files:', error);
      showNotification('Error uploading images. Please try again.', 'error');
    } finally {
      uploadButton.disabled = false;
      uploadButton.textContent = 'Upload Images';
      fileInput.value = '';
    }
  }

  function showImagePreviews(files) {
    [...files].forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => displayImage(e.target.result, true);
        reader.readAsDataURL(file);
      }
    });
  }

  function showNotification(message, type = 'info') {
    const notificationContainer = document.createElement('div');
    notificationContainer.className = `notification ${type}`;
    notificationContainer.textContent = message;
    document.body.appendChild(notificationContainer);

    setTimeout(() => {
      notificationContainer.remove();
    }, 3000);
  }

  // Handle file input change
  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  });

  // Handle upload button click
  uploadButton.addEventListener("click", () => {
    if (fileInput.files.length === 0) {
      showNotification('Please select photos to upload', 'error');
      return;
    }
    handleFiles(fileInput.files);
  });

  function displayImage(url, isPreview = false) {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Gallery Image';
    
    if (isPreview) {
      div.classList.add('preview');
    }
    
    div.appendChild(img);
    gallery.appendChild(div);
  }

  async function loadExistingImages() {
    try {
      gallery.innerHTML = '<div class="loading" role="status">Loading gallery...</div>';
      
      const imagesRef = ref(storage, 'images');
      const result = await listAll(imagesRef);
      
      gallery.innerHTML = ''; // Clear loading message
      
      for (const imageRef of result.items) {
        const url = await getDownloadURL(imageRef);
        displayImage(url);
      }
      
      if (result.items.length === 0) {
        gallery.innerHTML = '<p class="no-images">No images uploaded yet</p>';
      }
    } catch (error) {
      console.error('Error loading images:', error);
      gallery.innerHTML = '<p class="error">Error loading images. Please refresh the page.</p>';
    }
  }
});
