const imageGrid = document.getElementById('image-grid');

async function  fetchImages () {
    try
    {
        const response = await fetch('https://picsum.photos/v2/list?page=1&limit=10')
        const images = await response.json();
        images.forEach((image)=>{
            const imgElement = document.createElement('img');
            imgElement.src = image.download_url;
            imgElement.alt = image.author;
            imgElement.title = `Photo by ${image.author}`;
           // append the image to the  grid container 
            imageGrid.appendChild(imgElement);

        });
    }
    catch(error){
        console.error('Error fetching images',error);
    }
    
}
fetchImages();