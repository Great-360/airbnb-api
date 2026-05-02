export interface Listing {
    id: number;
    title: string;
    description: string;
    price: number;
    location: string;
    category: string;
    imageUrl: string;
    userId: number;
}

const listings: Listing[] = [
    {
        id: 1,
        title:"Luxury Apartment in Paris",
        description: "Beautiful apartment located in the heart of Paris, with stunning views of the Eiffel Tower.",
        price: 250,
        location: "Paris, France",
        category: "Real Estate",
        imageUrl: "https://example.com/images/paris-apartment.jpg",
        userId: 1
    },
    {
        id: 2,
        title:"Vintage Car for Sale",
        description: "Classic vintage car in excellent condition, perfect for collectors and enthusiasts.",
        price: 15000,
        location: "Los Angeles, USA",
        category: "Vehicles",
        imageUrl: "https://example.com/images/vintage-car.jpg",
        userId: 2
    },
    {
        id: 3,
        title:"Handmade Wooden Furniture",
        description: "Beautifully crafted handmade wooden furniture, perfect for adding a rustic touch to your home.",
        price: 500,
        location: "Austin, USA",
        category: "Home & Garden",
        imageUrl: "https://example.com/images/wooden-furniture.jpg",
        userId: 3
    },
    {
        id: 4,
        title:"Guitar Lessons",
        description: "Learn to play the guitar with experienced instructor, suitable for all skill levels.",
        price: 30,
        location: "New York, USA",
        category: "Services",
        imageUrl: "https://example.com/images/guitar-lessons.jpg",
        userId: 4
    },
    {
        id: 5, 
        title:"Painting Lessons",
        description: "Learn to paint with experienced instructor, suitable for all skill levels.",
        price: 30,
        location: "New York, USA",
        category: "Services",
        imageUrl: "https://example.com/images/painting-lessons.jpg",
        userId: 5
    }
]

export {listings};