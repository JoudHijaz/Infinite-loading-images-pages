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
    if (isLoading) return;
    isLoading = true;

    try {
        console.log(`Fetching images for page: ${page}`);
        const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch images');
        const images = await response.json();

        if (images.length === 0) {
            console.log('No more images to fetch.');
            return; // Stop if no images are returned
        }

        images.forEach((image) => {
            const linkElement = document.createElement('a');
            linkElement.href = '#';
            linkElement.classList.add('image-link');

            const imgElement = document.createElement('img');
            imgElement.src = image.download_url;
            imgElement.title = `Photo by ${image.author}`;
            imgElement.setAttribute('data-author', image.author);

            linkElement.appendChild(imgElement);
            imageGrid.appendChild(linkElement);
        });

        page++;
        console.log(`Page ${page - 1} images loaded successfully.`);
    } catch (error) {
        console.error('Error fetching images:', error);
    } finally {
        isLoading = false;
    }
}

window.addEventListener('scroll', () => {
    console.log(`Scroll Position: ${window.innerHeight + window.scrollY}`);
    console.log(`Document Height: ${document.body.offsetHeight}`);

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        console.log('Scroll condition met. Loading more images...');
        fetchImages();
    } else {
        console.log('Scroll condition not met yet.');
    }
});


// Initial Fetch
fetchImages();

function openModal(imageUrl, author) {
    modal.classList.remove('hidden'); 
    modalImage.src = imageUrl; 
    modalAuthor.textContent = `Author: ${author}`; 
    downloadButton.href = imageUrl; 
    downloadButton.download = `photo-by-${author.replace(/[^a-zA-Z0-9-]/g, "-")}.jpg`;
    console.log(downloadButton)

}

function closeModalHandler() {
    modal.classList.add('hidden'); 
}

closeModal.addEventListener('click', closeModalHandler);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalHandler();
    }
});

imageGrid.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        const imageUrl = e.target.src;
        const author = e.target.getAttribute('data-author');
        openModal(imageUrl, author);
    }
});