
import React from 'react';
import FadeIn from './FadeIn';

// Define the types of images we want to show
export type ImageCategory = 'financial' | 'mpesa' | 'profile' | 'general';

// Interface for our image objects
interface GalleryImage {
  src: string;
  alt: string;
  category: ImageCategory;
}

// Our gallery of images - using only the specified categories of images
const galleryImages: GalleryImage[] = [
  {
    src: "/lovable-uploads/29429bf4-4ba8-4306-83bd-297c2b454e09.png",
    alt: "Man using phone in front of M-Pesa shop",
    category: 'mpesa'
  },
  {
    src: "/lovable-uploads/92c8ab6b-e20f-4189-b055-bfea5ce6e47a.png",
    alt: "Woman using financial app on phone",
    category: 'financial'
  },
  {
    src: "/lovable-uploads/956bbafa-853c-45b0-a85b-59bd1daf04a1.png",
    alt: "Man in front of M-Pesa shop",
    category: 'mpesa'
  },
  {
    src: "/lovable-uploads/469f84d9-2724-4370-8329-ea06835f5ebc.png",
    alt: "Man using mobile banking",
    category: 'financial'
  }
];

interface ImageGalleryProps {
  category?: ImageCategory;
  index?: number;
  className?: string;
  maxHeight?: string;
  rounded?: string;
  delay?: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  category = 'financial',
  index = 0,
  className = '',
  maxHeight = '500px',
  rounded = 'rounded-2xl',
  delay = 0.2
}) => {
  // Filter images by category
  const filteredImages = category 
    ? galleryImages.filter(img => img.category === category)
    : galleryImages;
  
  // Get the specific image (with a safety check)
  const imageIndex = index < filteredImages.length ? index : 0;
  const image = filteredImages[imageIndex];
  
  if (!image) return null;
  
  return (
    <FadeIn delay={delay} className={className}>
      <img
        src={image.src}
        alt={image.alt}
        className={`object-cover w-full shadow-md ${rounded}`}
        style={{ maxHeight }}
      />
    </FadeIn>
  );
};

export default ImageGallery;
