import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function MediaPlayer({
  url,
  imageProps,
  videoProps,
}: {
  url: string;
  imageProps: {
    width: number;
    height: number;
    alt: string;
    className?: string;
  };
  videoProps: {
    className?: string;
  };
}) {
  const [showAsVideo, setShowAsVideo] = useState(false);
  const [showAsImage, setShowAsImage] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setShowAsImage(false);
    setShowAsVideo(true);
    setVideoLoading(true);
    setImageLoading(false);
  };

  const handleVideoError = () => {
    setShowAsVideo(false);
    setVideoLoading(false);
    console.error("Media failed to load");
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleVideoLoad = () => {
    setVideoLoading(false);
  };

  return (
    <>
      {showAsImage && (
        <Image
          src={url}
          alt={imageProps.alt}
          width={imageProps.width}
          height={imageProps.height}
          className={`${imageProps.className} ${imageLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
          priority={true}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}

      {showAsVideo && !showAsImage && (
        <video
          src={url}
          controls
          preload="metadata"
          className={`${videoProps.className} ${videoLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
        >
          Your browser does not support the video tag.
        </video>
      )}
    </>
  );
}
