const imageGrid = document.getElementById('image-grid');
let page = 1;
const limit = 5;
let isLoading = false;
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const modalAuthor = document.getElementById('modal-author');
const downloadButton = document.getElementById('download-button');
const closeModal = document.getElementById('close-modal');
const sentinel = document.createElement('div'); // Sentinel element for Intersection Observer
imageGrid.appendChild(sentinel);

async function fetchImages() {
    if (isLoading) return;
    isLoading = true;

    try {
        console.log(`Fetching images for page: ${page}`);
        const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch images');
        const images = await response.json();

        if (images.length === 0) {
            console.log('No more images to fetch.');
            return;
        }

        images.forEach((image) => {
            const linkElement = document.createElement('a');
            linkElement.href = '#';
            linkElement.classList.add('image-link');

            const imgElement = document.createElement('img');
            imgElement.src = image.download_url;
            imgElement.title = `Photo by ${image.author}`;
            imgElement.setAttribute('data-author', image.author);
            imgElement.setAttribute('data-download-url', image.download_url);

            linkElement.appendChild(imgElement);
            imageGrid.insertBefore(linkElement, sentinel);
        });

        page++;
        console.log(`Page ${page - 1} images loaded successfully.`);
    } catch (error) {
        console.error('Error fetching images:', error);
    } finally {
        isLoading = false;
    }
}

// Intersection Observer callback
function onIntersection(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            console.log('Sentinel is in view. Loading more images...');
            fetchImages();
        }
    });
}

// Create an Intersection Observer
const observer = new IntersectionObserver(onIntersection, {
    root: null,
    rootMargin: '0px',
    threshold: 1.0
});

// Observe the sentinel element
observer.observe(sentinel);

// Modal functionality
function openModal(imageUrl, author, downloadUrl) {
    modal.classList.remove('hidden');
    modalImage.src = imageUrl;
    modalAuthor.textContent = `Author: ${author}`;

    // Fetch the image as a Blob and set it for download
    fetch(downloadUrl)
        .then((response) => response.blob())
        .then((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            downloadButton.href = blobUrl; // Set the href to the Blob URL
            downloadButton.download = `photo-by-${author.replace(/[^a-zA-Z0-9]/g, "-")}.jpg`; // Set the download filename
        })
        .catch((error) => {
            console.error('Error creating download link:', error);
        });
}

// Modal Close Function
function closeModalHandler() {
    modal.classList.add('hidden');
}

// Event Listener for Closing Modal
closeModal.addEventListener('click', closeModalHandler);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalHandler();
    }
});

// Event Listener for Image Clicks
imageGrid.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        const imageUrl = e.target.src;
        const author = e.target.getAttribute('data-author');
        const downloadUrl = e.target.getAttribute('data-download-url');
        openModal(imageUrl, author, downloadUrl);
    }
});

// Initial Fetch of Images
fetchImages();