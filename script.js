const imageGrid = document.getElementById('image-grid');
let page = 1;
const limit = 5;
let isLoading = false;
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const modalAuthor = document.getElementById('modal-author');
const downloadButton = document.getElementById('download-button');
const closeModal = document.getElementById('close-modal');

async function fetchImages() {
    if (isLoading) {
        console.debug('Fetch skipped: Already loading.');
        return;
    }

    isLoading = true; // Block further fetches
    console.debug('Fetch initiated.');

    try {
        console.log(`Fetching images for page: ${page}`);
        const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${limit}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch images. HTTP status: ${response.status}`);
        }

        const images = await response.json();
        console.debug(`Fetched ${images.length} images from page: ${page}.`);

        if (images.length === 0) {
            console.warn('No more images to fetch.');
            return;
        }

        images.forEach((image, index) => {
            console.debug(`Processing image ${index + 1} from the response.`);
            const linkElement = document.createElement('a');
            linkElement.href = '#';
            linkElement.classList.add('image-link');

            const imgElement = document.createElement('img');
            imgElement.src = image.download_url;
            imgElement.title = `Photo by ${image.author}`;
            imgElement.setAttribute('data-author', image.author);
            imgElement.setAttribute('data-download-url', image.download_url);

            linkElement.appendChild(imgElement);
            imageGrid.appendChild(linkElement);
        });

        page++;
        console.info(`Page ${page - 1} images loaded successfully.`);
    } catch (error) {
        console.error('Error fetching images:', error);
    } finally {
        isLoading = false; // Unlock fetches after completion
        console.debug('Fetch completed. isLoading reset to false.');

        // Ensure content is scrollable; fetch more images if needed
        setTimeout(() => {
            if (window.innerHeight >= document.documentElement.scrollHeight) {
                console.log('Page not scrollable yet. Fetching more images...');
                fetchImages();
            }
        }, 100); // Small delay for rendering
    }
}

// Debounced Scroll Event
let debounceTimer;
window.addEventListener('scroll', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;

        console.debug(`Scroll event detected. Scroll Position: ${scrollPosition}, Document Height: ${documentHeight}`);

        if (scrollPosition >= documentHeight - 100 && !isLoading) {
            console.info('Scroll condition met. Loading more images...');
            fetchImages();
        } else {
            console.debug('Scroll condition not met. No fetch triggered.');
        }
    }, 150); // Adjust debounce time as needed
});

function openModal(imageUrl, author, downloadUrl) {
    console.debug('Modal opened for image:', imageUrl);
    modal.classList.remove('hidden');
    modalImage.src = imageUrl;
    modalAuthor.textContent = `Author: ${author}`;

    // Fetch the image as a Blob and set it for download
    fetch(downloadUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch image for download. HTTP status: ${response.status}`);
            }
            return response.blob();
        })
        .then((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            downloadButton.href = blobUrl; // Set the href to the Blob URL
            downloadButton.download = `photo-by-${author.replace(/[^a-zA-Z0-9]/g, "-")}.jpg`; // Set the download filename
            console.info(`Download link prepared for: ${downloadButton.download}`);
        })
        .catch((error) => {
            console.error('Error creating download link:', error);
        });
}

// Modal Close Function
function closeModalHandler() {
    console.debug('Modal closed.');
    modal.classList.add('hidden');
}

// Event Listener for Closing Modal
closeModal.addEventListener('click', closeModalHandler);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        console.debug('Modal background clicked. Closing modal.');
        closeModalHandler();
    }
});

// Event Listener for Image Clicks
imageGrid.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        const imageUrl = e.target.src;
        const author = e.target.getAttribute('data-author');
        const downloadUrl = e.target.getAttribute('data-download-url');
        console.debug(`Image clicked: ${imageUrl}, Author: ${author}`);
        openModal(imageUrl, author, downloadUrl);
    }
});

// Initial Fetch of Images
console.info('Starting initial image fetch.');
fetchImages();
