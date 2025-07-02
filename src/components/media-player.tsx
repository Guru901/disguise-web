import Image from "next/image";

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
  const contentType =
    url.endsWith(".mp4") || url.endsWith(".mkv") ? "video" : "image";

  return contentType === "image" ? (
    <Image
      src={url}
      alt={imageProps.alt}
      width={imageProps.width}
      height={imageProps.height}
      className={imageProps.className}
    />
  ) : (
    <div className={`${videoProps.className} relative`}>
      <video
        src={url}
        controls
        preload="metadata"
        className={videoProps.className}
      />
    </div>
  );
}
