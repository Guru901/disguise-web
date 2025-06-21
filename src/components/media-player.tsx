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
  const [contentType, setContentType] = useState("");
  const [loading, setLoading] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const response = await fetch(url, { method: "HEAD" }); // Use HEAD to fetch only headers
      const contentType = response.headers.get("Content-Type");
      if (!contentType) {
        console.log("Content-Type not available");
        return;
      }

      if (contentType.startsWith("image/")) {
        console.log("It is an image:", contentType);
        setContentType("image");
      } else if (contentType.startsWith("video/")) {
        console.log("It is a video:", contentType);
        setContentType("video");
      } else {
        console.log("Unknown type:", contentType);
      }
      setLoading(false);
    })();
  }, [url]);

  if (loading)
    return (
      <div
        className={`${imageProps.className} flex items-center justify-center`}
      >
        <Loader2 className="animate-spin" />
      </div>
    );

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
      {!videoLoaded && (
        <div className="bg-opacity-50 absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      <video
        src={url}
        controls
        preload="metadata"
        className={videoProps.className}
        onLoadedData={() => setVideoLoaded(true)}
        style={{
          opacity: videoLoaded ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />
    </div>
  );
}
